'use strict';


const cache = require(GLOBAL.paths.getService('cache'));

module.exports = {
	getCounties: getCounties,
	getCounty: getCounty,
	getCities: getCities,
};



function getCounties(stateSlug, fnCallback) {
	var cacheKey = 'getCounties():' + stateSlug;
	var statement = 'SELECT * FROM counties WHERE stateSlug = ? ORDER BY countyName';
	var params = [stateSlug];

	cache.get(cacheKey, statement, params, fnCallback);
}


function getCounty(stateSlug, countySlug, fnCallback) {
	var cacheKey = 'getCounty():' + stateSlug + ':' + countySlug;
	var statement = 'SELECT * FROM counties WHERE stateSlug = ? AND countySlug = ?';
	var params = [stateSlug, countySlug];

	cache.get(cacheKey, statement, params, fnCallback);
}


function getCities(stateSlug, countySlug, fnCallback) {
	var cacheKey = 'getCountyCities():' + stateSlug + ':' + countySlug;
	var statement = 'SELECT * FROM countyCities WHERE stateSlug = ? AND countySlug = ?';
	var params = [stateSlug, countySlug];

	cache.get(cacheKey, statement, params, fnCallback);
}
