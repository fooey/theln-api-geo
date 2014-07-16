'use strict';


const cache = require(GLOBAL.paths.getService('cache'));

module.exports = {
	getStates: getStates,
	getState: getState,
};



function getStates(fnCallback) {
	var cacheKey = 'getStates()';
	var statement = 'SELECT * FROM states ORDER BY stateName';
	var params = [];

	cache.get(cacheKey, statement, params, fnCallback);
};


function getState(stateSlug, fnCallback) {
	var cacheKey = 'getStates():' + stateSlug;
	var statement = 'SELECT * FROM states WHERE stateSlug = ?';
	var params = [stateSlug];

	cache.get(cacheKey, statement, params, fnCallback);
};
