'use strict';

// var _ = require('lodash');
const async = require('async');

const paths = require('./config/paths');
const db = require(paths.getConfig('db'));







/*
*	MAIN
*/


async.auto({
	'prepare': [createTables],
	'import': ['prepare', importData],
	'populate': ['import', populateTables],
	'cleanup': ['populate', doVacuum],
}, function(err, results) {
	console.log('importer done')
});













/*
*	PREPARE
*/

function createTables(fnCallback) {
	console.log("createTables()");

	var zipsCreate = 'DROP TABLE IF EXISTS zips; CREATE TABLE zips (' + [
		'zip TEXT PRIMARY KEY',
		'zipType TEXT',

		'stateName TEXT',
		'stateAbbr TEXT',
		'stateSlug TEXT',

		'countyName TEXT',
		'countySlug TEXT',

		'cityName TEXT',
		'citySlug TEXT',

		'latitude REAL',
		'longitude REAL',
	].join(', ') + ')';

	var statesCreate = 'DROP TABLE IF EXISTS states; CREATE TABLE states (' + [
		'stateName TEXT',
		'stateAbbr TEXT',
		'stateSlug TEXT',

		'numCounties NUMERIC',
		'numCities NUMERIC',
		'numZips NUMERIC',

		'minLatitude REAL',
		'maxLatitude REAL',
		'avgLatitude REAL',

		'minLongitude REAL',
		'maxLongitude REAL',
		'avgLongitude REAL',
	].join(', ') + ')';

	var countiesCreate = 'DROP TABLE IF EXISTS counties; CREATE TABLE counties (' + [
		'stateName TEXT',
		'stateAbbr TEXT',
		'stateSlug TEXT',

		'countyName TEXT',
		'countySlug TEXT',

		'numCities NUMERIC',
		'numZips NUMERIC',

		'minLatitude REAL',
		'maxLatitude REAL',
		'avgLatitude REAL',

		'minLongitude REAL',
		'maxLongitude REAL',
		'avgLongitude REAL',
	].join(', ') + ')';

	var citiesCreate = 'DROP TABLE IF EXISTS cities; CREATE TABLE cities (' + [
		'stateName TEXT',
		'stateAbbr TEXT',
		'stateSlug TEXT',

		'cityName TEXT',
		'citySlug TEXT',

		'numZips NUMERIC',

		'minLatitude REAL',
		'maxLatitude REAL',
		'avgLatitude REAL',

		'minLongitude REAL',
		'maxLongitude REAL',
		'avgLongitude REAL',
	].join(', ') + ')';

	var countyCitiesCreate = 'DROP TABLE IF EXISTS countyCities; CREATE TABLE countyCities (' + [
		'stateName TEXT',
		'stateAbbr TEXT',
		'stateSlug TEXT',

		'countyName TEXT',
		'countySlug TEXT',

		'cityName TEXT',
		'citySlug TEXT',

		'numZips NUMERIC',

		'minLatitude REAL',
		'maxLatitude REAL',
		'avgLatitude REAL',

		'minLongitude REAL',
		'maxLongitude REAL',
		'avgLongitude REAL',
	].join(', ') + ')';




	var statement = [
		zipsCreate,
		statesCreate,
		countiesCreate,
		citiesCreate,
		countyCitiesCreate,

		'CREATE INDEX IF NOT EXISTS IX_stateSlug ON states(stateSlug)',
		'CREATE INDEX IF NOT EXISTS IX_stateSlug_countySlug ON counties(stateSlug, countySlug)',
		'CREATE INDEX IF NOT EXISTS IX_stateSlug_citySlug ON cities(stateSlug, citySlug)',
		'CREATE INDEX IF NOT EXISTS IX_stateSlug_countySlug_citySlug ON countyCities(stateSlug, countySlug, citySlug)',
	].join('; ');

	// console.log(createTable);


	db.exec(statement, function(err) {
		if (err) throw (err);

		console.log('createTables() done');
		fnCallback(err);
	});
}





/*
*	IMPORT
*/

function importData(fnCallback) {
	async.auto({
		'load': [loadCSV],
		'insert': ['load', insertData],
	}, function(err, results) {
		console.log('importData() done');
		fnCallback();
	});

}



function loadCSV(fnCallback) {
	const csv = require('fast-csv');
	const fs = require('fs');

	console.log("loadCSV()");

	var csvOptions = {
		// delimiter: ',',
		// quote: '"',
		headers: true, //'ZIPCode,ZIPType,CityName,CityType,CountyName,CountyFIPS,StateName,StateAbbr,StateFIPS,MSACode,AreaCode,TimeZone,UTC,DST,Latitude,Longitude'.split(','),
		// trim: true,
	};
	var csvPath = 'data/zips.csv';
	var stream = fs.createReadStream(csvPath);


	var records = [];

	csv.fromStream(stream, csvOptions)
		.on("record", function(data) {
			records.push(data);
		})
		.on("end", function() {
			console.log("loadCSV() done");

			fnCallback(null, records);
		});
}



function insertData(fnCallback, results) {
	console.log("insertData()");
	var statement = db.prepare('INSERT INTO zips VALUES(?,?,?,?,?,?,?,?,?,?,?)');

	async.eachLimit(
		results.load,
		32,
		insertRow.bind(null, statement),
		function(err, results) {
			console.log("insertData() done");

			statement.finalize();
			fnCallback();
		}
	);
}



function insertRow(statement, record, fnCallback) {
	// console.log("insertRow()", arguments);

	if (record.CityType !== 'D') {
		fnCallback();
	}
	else {
		// console.log(record);

		var bindings = [
			record.ZIPCode,
			record.ZIPType,

			record.StateName,
			record.StateAbbr,
			getSlug(record.StateName),

			record.CountyName,
			getSlug(record.CountyName),

			record.CityName,
			getSlug(record.CityName),

			record.Latitude.trim(),
			record.Longitude.trim(),
		];


		statement.run(bindings, function(err) {
			if (err) console.log(err, bindings);
			// console.log(record.ZIPCode);

			fnCallback(null);
		});
	}
}



function populateTables(fnCallback) {
	console.log("populateTables()");
	async.parallel([
		populateStates,
		populateCounties,
		populateCities,
		populateCountyCities,
	], function(err, results) {
		console.log("populateTables() done");
		fnCallback();
	});
}





/*
*	POPULATE
*/

function populateStates(fnCallback) {
	var statement = [
		'insert into states',
		'select',
			'stateName,',
			'stateAbbr,',
			'stateSlug,',

			'COUNT(DISTINCT countyName) as numCounties,',
			'COUNT(DISTINCT cityName) as numCities,',
			'COUNT(DISTINCT zip) as numZips,',

			'MIN(latitude) AS minLatitude,',
			'MAX(latitude) AS maxLatitude,',
			'AVG(latitude) AS avgLatitude,',

			'MIN(longitude) AS minLongitude,',
			'MAX(longitude) AS maxLongitude,',
			'AVG(longitude) AS avgLongitude',
		'from zips',
		'group by',
			'stateName, stateAbbr, stateSlug',
		'order by',
			'stateName, stateAbbr, stateSlug',
	].join(' ');
	db.run(statement, fnCallback);
}



function populateCounties(fnCallback) {
	var statement = [
		'insert into counties',
		'select',
			'stateName,',
			'stateAbbr,',
			'stateSlug,',

			'countyName,',
			'countySlug,',

			'COUNT(DISTINCT cityName) as numCities,',
			'COUNT(DISTINCT zip) as numZips,',

			'MIN(latitude) AS minLatitude,',
			'MAX(latitude) AS maxLatitude,',
			'AVG(latitude) AS avgLatitude,',

			'MIN(longitude) AS minLongitude,',
			'MAX(longitude) AS maxLongitude,',
			'AVG(longitude) AS avgLongitude',
		'from zips',
		'group by',
			'stateName, stateAbbr, stateSlug,',
			'countyName, countySlug',
		'order by',
			'stateName, stateAbbr, stateSlug,',
			'countyName, countySlug',
	].join(' ');
	db.run(statement, fnCallback);
}



function populateCities(fnCallback) {
	var statement = [
		'insert into cities',
		'select',
			'stateName,',
			'stateAbbr,',
			'stateSlug,',
			'cityName,',
			'citySlug,',

			'COUNT(DISTINCT zip) as numZips,',

			'MIN(latitude) AS minLatitude,',
			'MAX(latitude) AS maxLatitude,',
			'AVG(latitude) AS avgLatitude,',

			'MIN(longitude) AS minLongitude,',
			'MAX(longitude) AS maxLongitude,',
			'AVG(longitude) AS avgLongitude',
		'from zips',
		'group by',
			'stateName, stateAbbr, stateSlug,',
			'cityName, citySlug',
		'order by',
			'stateName, stateAbbr, stateSlug,',
			'cityName, citySlug',
	].join(' ');
	db.run(statement, fnCallback);
}



function populateCountyCities(fnCallback) {
	var statement = [
		'insert into countyCities',
		'select',
			'stateName,',
			'stateAbbr,',
			'stateSlug,',

			'countyName,',
			'countySlug,',

			'cityName,',
			'citySlug,',

			'COUNT(DISTINCT zip) as numZips,',

			'MIN(latitude) AS minLatitude,',
			'MAX(latitude) AS maxLatitude,',
			'AVG(latitude) AS avgLatitude,',

			'MIN(longitude) AS minLongitude,',
			'MAX(longitude) AS maxLongitude,',
			'AVG(longitude) AS avgLongitude',
		'from zips',
		'group by',
			'stateName, stateAbbr, stateSlug,',
			'countyName, countySlug,',
			'cityName, citySlug',
		'order by',
			'stateName, stateAbbr, stateSlug,',
			'countyName, countySlug,',
			'cityName, citySlug',
	].join(' ');
	db.run(statement, fnCallback);
}





/*
*	CLEANUP
*/

function doVacuum(fnCallback) {
	db.run('VACUUM', fnCallback);
}





/*
*	UTIL
*/

function getSlug(str) {
	str = str.toLowerCase();
	str = str.replace(/[^a-z0-9]{1,}/g, ' ');
	str = str.trim();
	str = str.replace(/[ ]{1,}/g, '-');

	return str;
};

