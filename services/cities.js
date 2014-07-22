'use strict';

const _ = require('lodash');
const async = require('async');

const cache = require(GLOBAL.paths.getService('cache'));

module.exports = {
	getCities: getCities,
	getCity: getCity,
};



function getCities(stateSlug, fnCallback) {
	var cacheKey = 'getCities():' + stateSlug;
	var statement = 'SELECT * FROM cities WHERE stateSlug = ? ORDER BY cityName';
	var params = [stateSlug];

	cache.get(cacheKey, statement, params, fnCallback);
}


function getCity(stateSlug, citySlug, fnCallback) {
	if (citySlug.match(/,/)) {
		var cities = _.unique(citySlug.split(','));
		async.concat(
			cities,
			getCity.bind(null, stateSlug),
			fnCallback
		);
	}
	else {
		var cacheKey = 'getCity():' + stateSlug + ':' + citySlug;
		var statement = 'SELECT * FROM cities WHERE stateSlug = ? AND citySlug IN (?)';
		var params = [stateSlug, citySlug];

		cache.get(cacheKey, statement, params, fnCallback);
	}
}
