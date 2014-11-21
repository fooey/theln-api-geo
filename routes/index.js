'use strict';

const states = require(GLOBAL.paths.getService('states'));
const counties = require(GLOBAL.paths.getService('counties'));
const cities = require(GLOBAL.paths.getService('cities'));
const zips = require(GLOBAL.paths.getService('zips'));


module.exports = function(server, restify) {


	/*
	*	States
	*/

	server.get('/states',
		jsonData.bind(null, states.getStates, false)
	);



	server.get(/^\/states\/([a-z-]+)$/, function(req, res) {
		console.log('get state', req.params);

		const stateSlug = req.params[0];

		jsonData(
			states.getState.bind(null, stateSlug),
			true, req, res
		);
	});





	/*
	*	counties
	*/

	server.get(/^\/counties\/([a-z,-]+)$/, function(req, res) {
		console.log('get counties by state', req.params);

		const stateSlug = req.params[0];

		jsonData(
			counties.getCounties.bind(null, stateSlug),
			false, req, res
		);
	});



	server.get(/^\/counties\/([a-z-]+)\/([a-z-]+)$/, function(req, res) {
		console.log('get county', req.params);

		const stateSlug = req.params[0];
		const countySlug = req.params[1];

		jsonData(
			counties.getCounty.bind(null, stateSlug, countySlug),
			true, req, res
		);
	});



	server.get(/^\/counties\/([a-z-]+)\/([a-z-]+)\/cities$/, function(req, res) {
		console.log('get county cities', req.params);

		const stateSlug = req.params[0];
		const countySlug = req.params[1];

		jsonData(
			counties.getCities.bind(null, stateSlug, countySlug),
			false, req, res
		);
	});





	/*
	*	cities
	*/

	server.get(/^\/cities\/([a-z-]+)$/, function(req, res) {
		console.log('get cities', req.params);

		const stateSlug = req.params[0];

		jsonData(
			cities.getCities.bind(null, stateSlug),
			false, req, res
		);
	});



	server.get(/^\/cities\/([a-z-]+)\/([a-z-]+)$/, function(req, res) {
		console.log('get city', req.params);

		const stateSlug = req.params[0];
		const citySlug = req.params[1];

		jsonData(
			cities.getCity.bind(null, stateSlug, citySlug),
			true, req, res
		);
	});





	/*
	*	zip codes
	*/

	server.get(/^\/zips\/([a-z-]+)$/, function(req, res) {
		console.log('get zips', req.params);

		const stateSlug = req.params[0];

		jsonData(
			zips.getZips.bind(null, stateSlug),
			false, req, res
		);
	});



	server.get(/^\/zips\/([0-9,]{5,})$/, function(req, res) {
		console.log('get zip', req.params);

		const zip = req.params[0];

		jsonData(
			zips.getZip.bind(null, zip),
			true, req, res
		);
	});




	function dumpRoute(req, res) {
		res.send(req.params);
	}

	function jsonData(fnLookup, single, req, res) {
		fnLookup(function(err, data) {
			data = (single && data && data.length === 1) ? data[0] : data;

			const cacheTime = 60 * 15; // 15 minutes

			res.set({
				'Cache-Control': 'public, max-age=' + (cacheTime),
				'Expires': new Date(Date.now() + (cacheTime * 1000)).toUTCString(),
			});

			res.send(data);
		});
	}


};
