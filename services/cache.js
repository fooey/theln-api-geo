'use strict';

module.exports = {get: get};

function get(cacheKey, statement, params, fnCallback) {
	var result = GLOBAL.cache.get(cacheKey);

	if (result) {
		fnCallback(null, result);
	}
	else {
		// console.log(cacheKey);
		// console.log(statement);
		// console.log(params);

		db.all(statement, params, function(err, result) {
			GLOBAL.cache.set(cacheKey, result);
			fnCallback(err, result);
		});

	}
}
