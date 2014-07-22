'use strict';

const _ = require('lodash');
const async = require('async');

const cache = require(GLOBAL.paths.getService('cache'));

module.exports = {
	getZips: getZips,
	getZip: getZip,
};



function getZips(stateSlug, fnCallback) {
	var cacheKey = 'getZips()';
	var statement = 'SELECT * FROM zips WHERE stateSlug = ? ORDER BY zip';
	var params = [stateSlug];

	cache.get(cacheKey, statement, params, fnCallback);
}


function getZip(zip, fnCallback) {
	if (zip.match(/,/)) {
		var zips = _.unique(zip.split(','));
		async.concat(
			zips,
			getZip,
			fnCallback
		);
	}
	else {
		var cacheKey = 'getZip():' + zip;
		var statement = 'SELECT * FROM zips WHERE zip = ?';
		var params = [zip];

		cache.get(cacheKey, statement, params, fnCallback);
	}
}
