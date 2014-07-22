'use strict';

const _ = require('lodash');
const async = require('async');

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
	if (stateSlug.match(/,/)) {
		var states = _.unique(stateSlug.split(','));
		async.concat(
			states,
			getState,
			fnCallback
		);
	}
	else {
		var cacheKey = 'getStates():' + stateSlug;
		var statement = 'SELECT * FROM states WHERE stateSlug = ?';
		var params = [stateSlug];

		cache.get(cacheKey, statement, params, fnCallback);
	}
};
