'use strict';

const _ = require('lodash');
const veldt = require('veldt');
const $ = require('jquery');
const Transform = require('../transform/Transform');
// const lumo = require('lumo');


const VERTICAL_OFFSET = 24;
const HORIZONTAL_OFFSET = 0;
const NUM_ATTEMPTS = 1;

class WordGlyph extends veldt.Renderer.HTML.CommunityLabel {
    constructor(options = {}) {
        super(options);
    }

    drawTile(element, tile) {

    	console.log(tile);

        const frequency = tile.data.frequency;
        const tfidf = tile.data.tfidf;
        const temporal = tile.data.temporal;

    	const margin = 100;
    	const radius = Math.floor(frequency/100);

    	const divs = [];

    	divs.push(`
				
				<svg height="100" width="100">
					<circle cx="50" cy="20" r="${radius}" stroke="black" stroke-width="0.3" fill="blue" />
				</svg>
				`);


		element.innerHTML = divs.join('');

       
    }

}

module.exports = WordGlyph;
