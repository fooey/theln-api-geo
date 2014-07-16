'use strict';


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
	var cacheKey = 'getCity():' + stateSlug + ':' + citySlug;
	var statement = 'SELECT * FROM cities WHERE stateSlug = ? AND citySlug = ?';
	var params = [stateSlug, citySlug];

	cache.get(cacheKey, statement, params, fnCallback);
}
