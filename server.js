'use strict';
if (process.env.NODE_ENV !== 'development') {
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

// const LRU = require("lru-cache");
GLOBAL.cache = require('lru-cache')({
	max: process.env.CACHE_SIZE || 32,
	// length: function (n) { return n * 2 },
	// dispose: function (key, n) { n.close() },
	// maxAge: 1000 * 60 * 60,
});
console.log('LRU cache size:', process.env.CACHE_SIZE || 32);




/*
*
* Express
*
*/

const express = require('express');
const app = express();


/*
*
* Configuration
*
*/

require(GLOBAL.paths.getConfig('express'))(app, express);
console.log('App Environment', app.get('env'));

if (app.get('env') === 'development') {
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

require(GLOBAL.paths.getRoute())(app, express);





/*
*
* Server
*
*/

console.log(Date.now(), 'Running Node.js ' + process.version + ' with flags "' + process.execArgv.join(' ') + '"');
app.listen(app.get('port'), function() {
	console.log(Date.now(), 'Express server listening on port ' + app.get('port') + ' in mode: ' + process.env.NODE_ENV);
	// console.log(Date.now(), 'ENVIRONMENT:', process.env);
});
