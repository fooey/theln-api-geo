'use strict';

const states = require(GLOBAL.paths.getService('states'));
const counties = require(GLOBAL.paths.getService('counties'));
const cities = require(GLOBAL.paths.getService('cities'));
const zips = require(GLOBAL.paths.getService('zips'));


module.exports = function(app, express) {


	app.get('/states', jsonData.bind(null, states.getStates, false));
	app.get('/states/:stateSlug([a-z,-]+?)', function(req, res) {
		jsonData(
			states.getState.bind(null, req.params.stateSlug),
			true, req, res
		);
	});



	app.get('/counties/:stateSlug([a-z-]+?)', function(req, res) {
		jsonData(
			counties.getCounties.bind(null, req.params.stateSlug),
			false, req, res
		);
	});
	app.get('/counties/:stateSlug([a-z-]+?)/:countySlug([a-z-]+?)/cities', function(req, res) {
		jsonData(
			counties.getCities.bind(null, req.params.stateSlug, req.params.countySlug),
			false, req, res
		);
	});
	app.get('/counties/:stateSlug([a-z-]+?)/:countySlug([a-z-]+?)', function(req, res) {
		jsonData(
			counties.getCounty.bind(null, req.params.stateSlug, req.params.countySlug),
			true, req, res
		);
	});



	app.get('/cities/:stateSlug([a-z-]+?)', function(req, res) {
		jsonData(
			cities.getCities.bind(null, req.params.stateSlug),
			false, req, res
		);
	});
	app.get('/cities/:stateSlug([a-z-]+?)/:citySlug([a-z-,]+?)', function(req, res) {
		jsonData(
			cities.getCity.bind(null, req.params.stateSlug, req.params.citySlug),
			true, req, res
		);
	});


	app.get('/zips/:stateSlug([a-z-]+?)', function(req, res) {
		jsonData(
			zips.getZips.bind(null, req.params.stateSlug),
			false, req, res
		);
	});
	app.get('/zips/:zip([0-9,]{5,})', function(req, res) {
		jsonData(
			zips.getZip.bind(null, req.params.zip),
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
			
			res.json(data);
		});
	}


};
