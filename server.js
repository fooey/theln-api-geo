'use strict';

const nodeEnv = (process.env.NODE_ENV === 'development') ? 'development' : 'production';
const nodePort = process.env.PORT || 3000;


if (nodeEnv !== 'development') {
	require('newrelic');

	if (process.env.NODETIME_ACCOUNT_KEY) {
		require('nodetime').profile({
			accountKey: process.env.NODETIME_ACCOUNT_KEY,
			appName: 'local-dialysis' // optional
		});
	}
}




/*
*
*	GLOBALS
*
*/

GLOBAL.paths = require('./config/paths');

GLOBAL.db = require(GLOBAL.paths.getConfig('db'));


/*
* Caching
*/

const lruCacheSize = process.env.CACHE_SIZE || 32;

// const LRU = require("lru-cache");
GLOBAL.cache = require('lru-cache')({
	max: lruCacheSize,
	// length: function (n) { return n * 2 },
	// dispose: function (key, n) { n.close() },
	// maxAge: 1000 * 60 * 60,
});
console.log('LRU cache size:', lruCacheSize);




/*
*
* Restify
*
*/

const restify = require('restify');

var server = restify.createServer({
	name: 'theln-api-geo',
});


require('./config/restify')(server, restify);




/*
*
* extended cli logging
*
*/

if (nodeEnv === 'development') {
	require('longjohn');

	// ['log', 'warn'].forEach(function(method) {
	// 	var old = console[method];
	// 	console[method] = function() {
	// 	var stack = (new Error()).stack.split(/\n/);
	// 	// Chrome includes a single "Error" line, FF doesn't.
	// 	if (stack[0].indexOf('Error') === 0) {
	// 		stack = stack.slice(1);
	// 	}
	// 	var args = [].slice.apply(arguments).concat(['\n', stack[1].trim(), '\n']);
	// 	return old.apply(console, args);
	// 	};
	// });
}





/*
*
* Routes
*
*/

require(GLOBAL.paths.getRoute())(server, restify);





/*
*
* Server
*
*/

console.log(Date.now(), 'Running Node.js ' + process.version + ' with flags "' + process.execArgv.join(' ') + '"');
server.listen(nodePort, function() {
	console.log(Date.now(), 'Express server listening on port ' + nodePort + ' in mode: ' + nodeEnv);
	// console.log(Date.now(), 'ENVIRONMENT:', process.env);
});
