'use strict';
var paths = require('./paths')

var sqlite3 = require('sqlite3');
var config = [
	'PRAGMA synchronous = off',
	'PRAGMA read_uncommitted = true',
	'PRAGMA journal_mode = off',
	'PRAGMA auto_index = off',
];


var storage = paths.getData('sqlite.bin');
console.log(storage);

var db = new sqlite3.Database(storage);

db.exec(config.join(';'));

db.each('SELECT sqlite_version() AS version', function(err, row) {
	console.log(Date.now(), 'SQLite v' + row.version);
});

module.exports = db
