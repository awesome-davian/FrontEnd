'use strict';

const _ = require('lodash');
const $ = require('../util/jQueryAjaxArrayBuffer');
const lumo = require('lumo');
const veldt = require('veldt');
const TopicRenderer = require('../render/html/Topic');

function liveRequest(pipeline, requestor, index, type, xyz, name) {
	return function(coord, done) {
		const req = {
			pipeline: pipeline,
			uri: index,
			coord: {
				z: coord.z,
				x: coord.x,
				y: xyz ? Math.pow(2, coord.z) - 1 - coord.y : coord.y
			},
			tile: this.getTile(name),
			query: this.getQuery ? this.getQuery() : null
		};
		requestor
			.get(req)
			.done(url => {
				$.ajax({
					url: url,
					method: 'POST',
					contentType: 'application/json',
					data: JSON.stringify(req),
					dataType: type
				}).done(buffer => {
					done(null, buffer);
				}).fail((xhr) => {
					const obj = JSON.parse(xhr.responseText);
					const err = new Error(obj.error);
					console.error(err);
					done(err, null);
				});
			})
			.fail(err => {
				console.error(err);
				done(err, null);
			});
	};
}

function liveRequestJSON(pipeline, requestor, index, xyz = false, name = undefined) {
	return liveRequest(pipeline, requestor, index, 'json', xyz, name);
}

function liveRequestBuffer(pipeline, requestor, index, xyz = false, name = undefined) {
	return liveRequest(pipeline, requestor, index, 'arraybuffer', xyz, name);
}

module.exports = {
	/**
	 * Base CartoDB Image Layer
	 */
	cartodb: function(tileset, requestor) {
		const layer = new veldt.Layer.Rest();
		layer.setScheme('http');
		layer.setEndpoint('a.basemaps.cartocdn.com');
		layer.setExt('png');
		layer.requestTile = liveRequestBuffer('rest', requestor, tileset, true);
		return layer;
	},

	/**
	 * Blank Base Layer
	 */
	blank: function() {
		const layer = new lumo.Layer({
			renderer: new veldt.Renderer.WebGL.Repeat()
		});
		layer.requestTile = function(coord, done) {
			lumo.loadImage('images/base-tile.png', done);
		};
		return layer;
	},

	/**
	 * Heatmap Layer
	 */
	heatmap: function(meta, index, ramp, requestor) {
		const layer = new veldt.Layer.Heatmap(meta, {
			renderer: new veldt.Renderer.WebGL.Heatmap({
				colorRamp: ramp
			})
		});
		layer.setX('pixel.x', 0, Math.pow(2, 32));
		layer.setY('pixel.y', 0, Math.pow(2, 32));
		layer.setResolution(128);
		layer.requestTile = liveRequestBuffer('elastic', requestor, index);
		return layer;
	},

	/**
	 * S3 Heatmap Layer
	 */
	s3Heatmap: function(url, ramp, ext, requestor) {
		const layer = new veldt.Layer.Rest(null, {
			renderer: new veldt.Renderer.WebGL.Heatmap({
				colorRamp: ramp
			})
		});
		layer.setScheme('http');
		layer.setEndpoint('s3.amazonaws.com/graph-tiles/');
		layer.setExt('bin');
		layer.setPadCoords(true);
		layer.setResolution(256);
		layer.setOpacity(0.8);
		layer.requestTile = liveRequestBuffer('rest', requestor, url);
		return layer;
	},

	/**
	 * Count Layer
	 */
	count: function(meta, index, requestor) {
		const layer = new veldt.Layer.Count(meta);
		layer.setX('pixel.x', 0, Math.pow(2, 32));
		layer.setY('pixel.y', 0, Math.pow(2, 32));
		layer.requestTile = liveRequestJSON('elastic', requestor, index);
		return layer;
	},

	/**
	 * Macro Layer
	 */
	macro: function(meta, index, requestor) {
		const resolution = 256;
		const layer = new veldt.Layer.Macro(meta, {
			renderer: new veldt.Renderer.WebGL.Macro({
				maxVertices: resolution * resolution,
				radius: 6,
				color: [ 0.4, 1.0, 0.1, 0.8 ]
			})
		});
		layer.setX('pixel.x', 0, Math.pow(2, 32));
		layer.setY('pixel.y', 0, Math.pow(2, 32));
		layer.setResolution(resolution);
		layer.setLOD(4);
		layer.requestTile = liveRequestBuffer('elastic', requestor, index);
		return layer;
	},

	/**
	 * Micro Layer
	 */
	micro: function(meta, index, count, requestor) {
		const layer = new veldt.Layer.Micro(meta, {
			renderer: new veldt.Renderer.WebGL.Micro({
				maxVertices: count,
				radius: 6,
				color: [ 1.0, 0.4, 0.1, 0.8 ]
			})
		});
		layer.setX('pixel.x', 0, Math.pow(2, 32));
		layer.setY('pixel.y', 0, Math.pow(2, 32));
		layer.setLOD(4);
		layer.setHitsCount(count);
		layer.setIncludeFields([
			'text',
		]);
		layer.requestTile = liveRequestJSON('elastic', requestor, index);
		return layer;
	},

	/**
	 * Micro / Macro Layer
	 */
	microMacro: function(meta, index, requestor) {

		const microCount = 2048;

		const count = this.count(meta, index, requestor);
		const macro = this.macro(meta, index, requestor);
		const micro = this.micro(meta, index, microCount, requestor);

		// disable both
		macro.disable();
		micro.disable();

		const group = new veldt.Layer.Group({
			layers: [
				count,
				macro,
				micro
			]
		});

		const swap = function() {
			// first we find out which level of tiles to inspect.
			let level = 0;
			if (count.plot.zoomAnimation) {
				// if zooming, use the target level
				level = Math.round(count.plot.zoomAnimation.targetZoom);
			} else {
				// if not zooming, use the current level
				level = Math.round(count.plot.zoom);
			}
			// next we inspect all tiles for that level
			const tiles = count.pyramid.levels.get(level);
			if (!tiles) {
				// no tiles yet, occurs on a fresh zoom
				return;
			}
			// ensure we have tiles
			if (tiles.length === 0) {
				return;
			}
			// check if they are below the set count
			const below = _.sumBy(tiles, tile => {
				return (tile.data.count < microCount) ? 1 : 0;
			});
			// swap accordingly
			if (below === tiles.length) {
				macro.disable();
				micro.enable();
			} else {
				micro.disable();
				macro.enable();
			}
		};

		count.on('onadd', () => {
			count.plot.on('zoomend', swap);
			count.plot.on('panend', swap);
		});

		count.on('onremove', () => {
			count.plot.removeListener('zoomend', swap);
			count.plot.removeListener('panend', swap);
		});

		count.on('load', swap);

		return group;
	},

	/**
	 * Wordcloud Layer
	 */
	wordcloud: function(meta, index, requestor) {
		const layer = new veldt.Layer.TopTermCount(meta, {
			renderer: new veldt.Renderer.HTML.WordCloud()
		});
		layer.setX('pixel.x', 0, Math.pow(2, 32));
		layer.setY('pixel.y', 0, Math.pow(2, 32));
		layer.setTermsField('hashtags');
		layer.setTermsCount(10);
		layer.requestTile = liveRequestJSON('elastic', requestor, index);
		return layer;
	},

	/**
	 * Topic Layer
	 */
	topic: function(meta, index, requestor) {
		const layer = new veldt.Layer.Topic(meta, {
			renderer: new TopicRenderer()
		});
		layer.setXField('pixel.x');
		layer.setYField('pixel.y');
		layer.requestTile = liveRequestJSON('remote', requestor, index);
		return layer;
	},

	/**
	 * Exclusiveness Layer
	 */
	exclusiveness: function(meta, index, ramp, requestor) {
		const layer = new veldt.Layer.Exclusiveness(meta, {
			renderer: new veldt.Renderer.WebGL.Heatmap({
				colorRamp: ramp
			})
		});
		layer.setXField('pixel.x');
		layer.setYField('pixel.y');
		layer.setResolution(1);
		layer.opacity = 0.2;
		layer.requestTile = liveRequestBuffer('remote', requestor, index, false, 'exclusiveness');
		return layer;
	},

	/**
	 * Community Layer
	 */
	communityRing: function(meta, index, count, requestor) {
		const layer = new veldt.Layer.Community(meta, {
			renderer: new veldt.Renderer.WebGL.Community({
				maxVertices: count,
				radiusField: 'node.radius'
			})
		});
		layer.setX('node.pixel.x', 0, Math.pow(2, 32));
		layer.setY('node.pixel.y', Math.pow(2, 32), 0); // inverted, re-ingest
		layer.setHitsCount(count);
		layer.setSortField('properties.degree');
		layer.setSortOrder('desc');
		layer.setIncludeFields([
			'node.radius',
			'properties.degree'
		]);
		layer.requestTile = liveRequestJSON('elastic', requestor, index);

		const hierarchy = {
			0: '5',
			1: '5',
			2: '5',
			3: '5',
			4: '5',
			5: '5',
			6: '4',
			7: '4',
			8: '3',
			9: '3',
			10: '2',
			11: '2',
			12: '2',
			13: '1',
			14: '1',
			15: '0',
			16: '0',
			17: '0',
			18: '0',
			19: '0',
			20: '0',
			21: '0',
			22: '0',
			23: '0'
		};

		layer.setQuery(() => {
			return [
				{
					equals: {
						field: 'properties.hierarchyLevel',
						value: hierarchy[Math.round(layer.plot.zoom)]
					}
				},
				'AND',
				{
					equals: {
						field: 'properties.type',
						value: 'community'
					}
				}
			];
		});
		return layer;
	},

	 /**
 	 * Community Label Layer
 	 */
	communityLabel: function(meta, index, count, requestor) {
		const layer = new veldt.Layer.Community(meta, {
			renderer: new veldt.Renderer.HTML.CommunityLabel({
				labelField: 'description'
			})
		});
		layer.setX('node.pixel.x', 0, Math.pow(2, 32));
		layer.setY('node.pixel.y', Math.pow(2, 32), 0); // inverted, re-ingest
		layer.setHitsCount(count);
		layer.setSortField('properties.degree');
		layer.setSortOrder('desc');
		layer.setIncludeFields([
			'description',
			'properties.degree'
		]);
		layer.requestTile = liveRequestJSON('elastic', requestor, index);

		const hierarchy = {
			0: '5',
			1: '5',
			2: '5',
			3: '5',
			4: '5',
			5: '5',
			6: '4',
			7: '4',
			8: '3',
			9: '3',
			10: '2',
			11: '2',
			12: '2',
			13: '1',
			14: '1',
			15: '0',
			16: '0',
			17: '0',
			18: '0',
			19: '0',
			20: '0',
			21: '0',
			22: '0',
			23: '0'
		};

		layer.setQuery(() => {
			return [
				{
					equals: {
						field: 'properties.hierarchyLevel',
						value: hierarchy[Math.round(layer.plot.zoom)]
					}
				},
				'AND',
				{
					equals: {
						field: 'properties.type',
						value: 'community'
					}
				}
			];
		});
		return layer;
	}


};
