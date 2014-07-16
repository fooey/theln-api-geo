'use strict';

module.exports = function(app, express) {

	app.set('env', (process.env.NODE_ENV === 'development') ? 'development' : 'production');


	/*
	*
	* Middleware
	*
	*/

	const morgan = require('morgan');
	const errorHandler = require('errorhandler');
	const compression = require('compression');
	const slashes = require('connect-slashes');

	if (app.get('env') === 'development') {
		app.use(errorHandler({ dumpExceptions: true, showStack: true }));
		app.locals.pretty = true;
		app.use(morgan('dev'));
		app.set('view cache', false);
	}
	else {
		app.use(errorHandler());
		app.use(morgan());
		app.set('view cache', true);
	}

	// all environments
	app.use(compression());
	app.use(slashes(false)); // no trailing slashes

	app.set('port', process.env.PORT || 3003);
	app.set('views', GLOBAL.paths.getView());
	app.set('view engine', 'jade');
};

