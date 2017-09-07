'use strict';

const $ = require('jquery');
const veldt = require('veldt');
const lumo = require('lumo');
const parallel = require('async/parallel');
const Layers = require('./scripts/layer/Layers');
const TopicDriver = require('./scripts/ui/TopicDriver');
const TopicDrilldown = require('./scripts/ui/TopicDrilldown');
const TileDetailInfo = require('./scripts/ui/TileDetailInfo');


function init(plot, callback) {
	const req = {};
	// tile requestor
	req.requestor = done => {
		const requestor = new veldt.Requestor('tile', () => {
			done(null, requestor);
		});
	};

	const driver = new TopicDriver('Topics', plot);
	$('.tile-controls').append(driver.getElement());
	driver.show();

	const drilldown = new TopicDrilldown('Tweets by Time', plot, {}, '', '');
	$('.tile-drilldown').append(drilldown.getElement());

	const topicPopup = new TileDetailInfo('Tile Detail info', plot, {}, '', '');
	$('.topic-detail').append(topicPopup.getElement());


	// request everything at once in a blaze of glory
	parallel(req, (err, res) => {
		// check for error
		if (err) {
			callback(err, null);
			return;
		}
		// execute callback
		callback(null, {
			requestor: res.requestor,
			drilldown: drilldown,
			driver: driver,
			topicPopup: topicPopup
		});
	});
}

window.startApp = function() {

	// Map control
	const map = new lumo.Plot('#map', {
		continuousZoom: false,
		zoom: 10,
		minZoom: 9,
		maxZoom: 13
	});
	// Center on NYC.
	map.viewport.centerOn(
		{
			x: 0.2944 * Math.pow(2, 10) * 256,
			y: 0.6242 * Math.pow(2, 10) * 256
		}
	);


	// Pull meta data and establish a websocket connection for generating tiles
	init(map, (err, res) =>{
		if (err) {
			console.error(err);
			return;
		}

		const requestor = res.requestor;

		/**
		 * CartoDB layer
		 * Styles for basemaps: light_all, dark_all, light_nolabels, light_only_labels, dark_nolabels, and dark_only_labels
		 */
		const carto_light = Layers.cartodb_light('light_all', requestor); 
		map.addLayer(carto_light);
		carto_light.hide();

		const carto_black = Layers.cartodb_dark('dark_all', requestor);
		map.addLayer(carto_black);
		// carto_black.hide();

		/**
		 * Topic layer
		 */
		const topic = Layers.topic(
			{},
			'',
			requestor);
		
		topic.mute();
		map.addLayer(topic);

		// /**
		//  * Hitmap layer
		//  */
		// const hitmap = Layers.exclusiveness(
		// 	{},
		// 	'',
		// 	'hot',
		// 	requestor);
		// hitmap.mute();
		// map.addLayer(hitmap);

		/**
		 * Macro layer
		 */
		const geopoint = Layers.geopoint(
			{},
			'',
			requestor);
		geopoint.mute();
		map.addLayer(geopoint);

		/**
		* WordGlyph layer
		*/
		const wordglyph = Layers.wordglyph(
			{},
			'',
			requestor);
		wordglyph.mute();
		map.addLayer(wordglyph);
		
		// show topic drilldown if click word  
		topic.renderer.on('click', event => res.drilldown.get_coord(event.plotPx.x, event.plotPx.y, event.data));
		
		topic.renderer.on('click', event => res.driver.onShowWordGlyph(event.target, event.data));
		topic.renderer.on('click', event => res.driver.onShowGeoPoint(event.target, event.data));
		// topic.renderer.on('click', event => res.driver.onHideTileGlyph());

		map.on('click', event => res.driver.onHideWordGlyph());
		map.on('click', event => res.driver.onHideGeoPoint());
		// map.on('click', event => res.driver.onShowTileGlyph(event.target));

		map.on('dblclick', event => res.topicPopup.show(event.data));
        map.on('dblclick', event => res.topicPopup.get_coord(event.plotPx.x, event.plotPx.y, event.data));

        res.driver.onShowTopics();
	});
};
