'use strict';

const _ = require('lodash');
const veldt = require('veldt');
const $ = require('jquery');
const Transform = require('../transform/Transform');
// const lumo = require('lumo');


const VERTICAL_OFFSET = 24;
const HORIZONTAL_OFFSET = 0;
const NUM_ATTEMPTS = 1;

class Glyph extends veldt.Renderer.HTML.WordCloud {
    constructor(options = {}) {
        super(options);
    }

    drawTile(element, tile) {

    	console.log(tile);

    	const margin = 5;
    	const radius = 5;

    	const divs = [];

    	divs.push(`
				<div class="glyph"
				    style = "
				        right: ${200}px;
				        top : ${margin}px;
				        width: ${100}px;
				        height: ${100}px;
				        float : left;
				        "
					</div>	
				<svg height="100" width="100">
					<circle cx="20" cy="20" r="${radius}" stroke="black" stroke-width="0.3" fill="red" />
				</svg>
				`);


		element.innerHTML = divs.join('');

       

		
		// cloud.forEach(word => {
  //           const combinedText = word.text;
  //           //console.log(word);
  //           word.text = this.parseTextValue(combinedText);
  //           word.group = this.parseGroupValue(combinedText);

  //           const groupColor = this._getWordColor(word.group, groupCount);

		// 	const highlight = (word.text === this.highlight) ? 'highlight' : '';
		// 	// create element for word
		// 	divs.push(`
		// 		<div class="
		// 			word-cloud-label
		// 			word-cloud-label-${word.percent}
		// 			${highlight}"
		// 			style="
		// 				font-size: ${word.fontSize}px;
		// 				left: ${(halfSize + word.x) - (word.width / 2)}px;
		// 				top: ${(halfSize + word.y) - (word.height / 2)}px;
		// 				width: ${word.width}px;
		// 				height: ${word.height}px;
  //                       color: ${groupColor};"
		// 			data-word="${word.text}" 
		// 			data-count="${word.count}">${word.text}
		// 			</div>
		// 		<div class="word-count-popup
		// 		            word-count-label-${word.percent}" 
		// 		    style="
		// 		        font-size: ${count_font_size}px;
		// 		        width: ${word.width}px;
		// 				height: ${word.height}px;
		// 				color: ${count_color};
		// 				left: ${200}px;
		// 				top: ${margin}px;""
						
		// 			data-word-popup="${word.text}" 
		// 			data-count="{word.count}">${word.count}</div>	
		// 		`);

			
		// });

		// element.innerHTML = divs.join('');

    }

 //    onMouseOver(event){

 //    	const word = $(event.target).attr('data-word');
 //        const value = $('[data-word=' + word + ']').text();
 //        $('[data-word-popup=' + word + ']').show();
	// }


	// onMouseOut(event){

	// 	const word = $(event.target).attr('data-word');
 //        const value = $('[data-word=' + word + ']').text();
 //        $('[data-word-popup=' + word + ']').hide();
	// }


 //    onDblClick(event) {
	// 	console.log('hihi');
 //    }


 
 //    parseTextValue(combinedText) {
 //        return combinedText.split(':')[1];
 //    }

 //    parseGroupValue(combinedText) {
 //        return combinedText.split(':')[0];
 //    }

 //    getGroupCount(wordCounts) {
 //        const groups = wordCounts.map(value => {
 //            return parseInt(value.group, 10);
 //        });
 //        return Math.max(...groups) + 1;
 //    }
}

module.exports = Glyph;
