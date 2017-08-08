'use strict';

const _ = require('lodash');
const veldt = require('veldt');
const $ = require('jquery');
const Transform = require('../transform/Transform');
const lumo = require('lumo'); 


const VERTICAL_OFFSET = 24;
const HORIZONTAL_OFFSET = 0;
const NUM_ATTEMPTS = 1;

let wordSelected = false;

const getMouseButton = function(event) {
	if (event.which === 1) {
		return 'left';
	} else if (event.which === 2) {
		return 'middle';
	} else if (event.which === 3) {
		return 'right';
	}
};

/**
 *  Returns true if bounding box a intersects bounding box b
 */
const intersectTest = function(a, b) {
	return (Math.abs(a.x - b.x) * 2 < (a.width + b.width)) &&
		(Math.abs(a.y - b.y) * 2 < (a.height + b.height));
};

/**
 *  Returns true if bounding box a is not fully contained inside bounding box b
 */
const overlapTest = function(a, b) {
	return (a.x + a.width / 2 > b.x + b.width / 2 ||
		a.x - a.width / 2 < b.x - b.width / 2 ||
		a.y + a.height / 2 > b.y + b.height / 2 ||
		a.y - a.height / 2 < b.y - b.height / 2);
};

/**
 * Check if a word intersects another word, or is not fully contained in the
 * tile bounding box
 */
const intersectWord = function(position, word, cloud, bb) {
	const box = {
		x: position.x,
		y: position.y,
		height: word.height,
		width: word.width
	};
	for (let i = 0; i < cloud.length; i++) {
		if (intersectTest(box, cloud[i])) {
			return true;
		}
	}
	// make sure it doesn't intersect the border;
	if (overlapTest(box, bb)) {
		// if it hits a border, increment collision count
		// and extend arc length
		position.collisions++;
		position.arcLength = position.radius;
		return true;
	}
	return false;
};

// const getMouseButton = function(event) {
// 	if (event.which === 1) {
// 		return 'left';
// 	} else if (event.which === 2) {
// 		return 'middle';
// 	} else if (event.which === 3) {
// 		return 'right';
// 	}
// };

const sortWords = function(words) {

	var sorted = splitWordsbyGroup(words);

	sorted.forEach( group => {
		group = group.sort( function(a, b) {
			return b.count - a.count;
		});
	});

	sorted.sort( function(a, b){
		var cnt_a = 0;
		a.forEach(word=>{
			cnt_a += word.count;
		});

		var cnt_b = 0;
		b.forEach(word=>{
			cnt_b += word.count;
		});

		// if (cnt_b < cnt_a) {
		// 	var temp_group = a.group;
		// 	a.group = b.group;
		// 	b.group = temp_group;
		// }

		return cnt_b - cnt_a;
	});

	sorted.forEach(function(group, idx){
		group.forEach(word=>{
			word.group = idx;
			word.text = idx + ':' + word.text;
		});
	});

	var new_words = [];
	sorted.forEach( group => {
		group = group.forEach(word => {
			new_words.push(word);
		});
	});

	return new_words;
};

const measureWords = function(renderer, wordCounts, extrema) {
	// sort words by frequency
	/*wordCounts = wordCounts.sort((a, b) => {
		return b.count - a.count;
	}).slice(0, renderer.maxNumWords);*/

	wordCounts.slice(0, renderer.maxNumWords);

	// build measurement html
	const $html = $('<div style="height:256px; width:256px;"></div>');
	const minFontSize = renderer.minFontSize;
	const maxFontSize = renderer.maxFontSize - 1;
	const transform = renderer.transform;
	wordCounts.forEach(word => {
		word.percent = Transform.transform(word.count, transform, extrema);
		word.fontSize = minFontSize + word.percent * (maxFontSize - minFontSize);
		word.count = word.count;
		$html.append(
			`
			<div class="word-cloud-label" style="
				visibility:hidden;
				font-size: ${word.fontSize}px;">${word.text}</div>;
			`);
	});

	// append measurements
	$('body').append($html);
	$html.children().each((index, elem) => {
		wordCounts[index].width = elem.offsetWidth;
		wordCounts[index].height = elem.offsetHeight;
	});
	$html.remove();
	return wordCounts;
};

const splitWordsbyGroup = function(words) {

	const groups = {};
	words.map(value=> {
		groups[value.group] = [];
	});

	words.forEach(word => {
		groups[word.group].push(word);
	});

	var groupArray = [];
	for (var each in groups){
		groupArray.push(groups[each]);
	}

	return groupArray;
};

const spiralPosition2 = function(pos, groupIndex, groupCount) {
	const pi2 = 2 * Math.PI;
	const circ = pi2 * pos.radius;
	
	let start = (pi2 / (groupCount-1))*(groupIndex-1) + ((circ/360)*(120+10))/pos.radius;
	let end = (pi2 / (groupCount-1))*(groupIndex) + ((circ/360)*(120-10))/pos.radius;
	
	if (groupIndex === 3) {
		start -= ((circ/360)*(30))/pos.radius;
		end -= ((circ/360)*(30))/pos.radius;
	}
	let center = (start + end)/2;

	const inc = (pos.arcLength > circ / 30) ? circ / 30 : pos.arcLength;
	let da = inc / pos.radius;
	let nt = 0;

	// console.log(da);

	if (pos.is_first === 1){
		nt = center;
		pos.is_first = 0;
		// console.log('a');
	} else {

		if (groupIndex === 0)
			nt = pos.t + da;
		else {
			if (pos.index % 2 === 0) {
				// just change the direction
				nt = center + -1*(pos.t - center);
				// console.log('['+pos.index+']b, nt: ' + nt + ', center: ' + center + ', pos.t: ' + pos.t);
			} else {
				// keep the direction and increase the angle
				if ((pos.t - center) > 0){
					nt = (pos.t + da);
					// console.log('['+pos.index+']c, nt: ' + nt + 'r: ' + pos.radius);
				} else {
					nt = (pos.t - da);
					// console.log('['+pos.index+']d, nt: ' + nt + 'r: ' + pos.radius);
				}
			}	
		}
		
	}

	if (start > pi2 && end > pi2) {
		start = start % pi2;
		end = end % pi2;
	}

	// var log = 'start: ' + start + ', end: ' + end;
	// console.log(log);

	if (groupIndex == 0) {
		if (nt > pi2) {	
			nt = nt % pi2;
			pos.radius = pos.radius + pos.radiusInc;	
		}
	} else {
		if (nt < start || nt > end || nt > pi2) {
			pos.radius = pos.radius + pos.radiusInc;	
		}
		if (nt < start || nt > end) {
			nt = center;
		}
	}

	pos.t = nt;
	pos.x = pos.radius * Math.cos(nt);
	pos.y = pos.radius * Math.sin(nt);
	pos.index += 1;

	// console.log(pos.t);
	return pos;
};

const spiralPosition3 = function(pos, groupIndex, groupCount) {
	const pi2 = 2 * Math.PI;
	const circ = pi2 * pos.radius;
	
	let start = (pi2 / (groupCount-1))*(groupIndex-1) + ((circ/360)*(120+10))/pos.radius;
	let end = (pi2 / (groupCount-1))*(groupIndex) + ((circ/360)*(120-10))/pos.radius;
	
	if (groupIndex == 3) {
		start -= ((circ/360)*(30))/pos.radius;
		end -= ((circ/360)*(30))/pos.radius;
	}
	let center = (start + end)/2;

	const inc = (pos.arcLength > circ / 30) ? circ / 30 : pos.arcLength;
	let da = inc / pos.radius;
	let nt = 0;

	// console.log(da);

	if (pos.is_first === 1){
		nt = center;
		pos.is_first = 0;
		// console.log('a');
	} else {

		if (groupIndex === 0)
			nt = pos.t + da;
		else {
			if (pos.index % 2 === 0) {
				// just change the direction
				nt = center + -1*(pos.t - center);
				// console.log('['+pos.index+']b, nt: ' + nt + ', center: ' + center + ', pos.t: ' + pos.t);
			} else {
				// keep the direction and increase the angle
				if ((pos.t - center) > 0){
					nt = (pos.t + da);
					// console.log('['+pos.index+']c, nt: ' + nt + 'r: ' + pos.radius);
				} else {
					nt = (pos.t - da);
					// console.log('['+pos.index+']d, nt: ' + nt + 'r: ' + pos.radius);
				}
			}	
		}
		
	}

	if (start > pi2 && end > pi2) {
		start = start % pi2;
		end = end % pi2;
	}

	// var log = 'start: ' + start + ', end: ' + end;
	// console.log(log);

	if (groupIndex === 0) {
		if (nt > pi2) {	
			nt = nt % pi2;
			pos.radius = pos.radius + pos.radiusInc;	
		}
	} else {
		if (nt < start || nt > end || nt > pi2) {
			pos.radius = pos.radius + pos.radiusInc;	
		}
		if (nt < start || nt > end) {
			nt = center;
		}
	}

	pos.t = nt;
	pos.x = pos.radius * Math.cos(nt);
	pos.y = pos.radius * Math.sin(nt);
	pos.index += 1;

	// console.log(pos.t);
	return pos;
};

const createWordCloud = function(renderer, wordCounts, extrema) {

	const tileSize = renderer.layer.plot.tileSize;
	const boundingBox = {
		width: tileSize - HORIZONTAL_OFFSET * 2,
		height: tileSize - VERTICAL_OFFSET * 2,
		x: 0,
		y: 0
	};

	const cloud = [];

	wordCounts = sortWords(wordCounts);

	// console.log(wordCounts);

	// measure the words size
	wordCounts = measureWords(renderer, wordCounts, extrema);

	// assemble word cloud
	wordCounts.forEach(wordCount => {
		// starting spiral position
		let pos = {
			radius: 1,
			radiusInc: 2,
			arcLength: 5,
			x: 0,
			y: 0,
			t: 0,
			collisions: 0,
			a: 0, 
			b:0,
			index :0,
			is_first: 1,
			
		};
		//console.log(wordCounts);

		const length= wordCounts.length;
		
		const groups = wordCounts.map(value => {
            return parseInt(value.group, 10);
        });
        const groupCount = Math.max(...groups) + 1;
        const topicCount = length/groupCount;

		// spiral outwards to find position
		while (pos.collisions < NUM_ATTEMPTS) {
			
			// increment position in a spiral
			pos = spiralPosition3(pos, wordCount.group, groupCount);
			// test for intersection
			if (!intersectWord(pos, wordCount, cloud, boundingBox)) {
				
				cloud.push({
					text: wordCount.text,
					fontSize: wordCount.fontSize,
					percent: Math.round((wordCount.percent * 100) / 10) * 10, // round to nearest 10
					x: pos.x,
					y: pos.y,
					width: wordCount.width,
					height: wordCount.height,
					count : wordCount.count

				});
				break;
			}
		}
	});

	return cloud;
};

class Topic extends veldt.Renderer.HTML.WordCloud {
    constructor(options = {}) {
        super(options);
    }

    _getWordColor(group, groupCount) {
        const colorJump = Math.floor(255 / (Math.floor(groupCount / 5) + 1));
        const colorGroup = group % 5;

        //const color_map = ['#ffff99','#beaed4','#ccebc5','#d629d1','#df6161'];
        //const color_map =['69DC37','5E009C','F839E9','FFF300','E85A08'];
	//const color_map = ['ff7f0e','2ca02c','d62728','9467bd','8c564b'];
        const color_map = ['ffffff','ff3c82','89c541','fee801','b93cff'];

        const colors = ['FF', 'FF', 'FF'];
        const colorAdjustment = colorJump * (Math.floor(group / 5) + 1);
        colors[colorGroup] = ('00' + (255 - colorAdjustment)
            .toString(16)).substr(-2).toUpperCase();

        // console.log('group: ' + group);
        // console.log('group count: ' + groupCount);
        // console.log('color group: ' + colorGroup);

        //return '#' + colors[2] + colors[1] + colors[0];
        return '#' +color_map[colorGroup];
    };

    

    drawTile(element, tile) {
		
		// console.trace();
  //   	console.log(tile);

    	//console.log(tile.data);
        const wordCounts = _.flatMap(tile.data, (value, key) => {
            return _.map(value.words, (weight, word) => {
    			return {
    				// text: key + ':' + word,
					text: word,
    				count: weight,
                    group: key
    			};
    		});
        });
		// console.log(wordCounts);

        const groupCount = this.getGroupCount(wordCounts);
		const layer = this.layer;
		const extrema = layer.getExtrema(tile.coord.z);
		// genereate the cloud
		const cloud = createWordCloud(this, wordCounts, extrema);
		// half tile size
		const halfSize = layer.plot.tileSize / 2;
		const tileSize = layer.plot.tileSize;
  		// create html for tile
		const divs = [];
		const count_divs = [];
		// for each word int he cloud

		const margin = 5;
		const count_font_size = 18;
		const count_color = '#ffffff';

		cloud.forEach(word => {
            const combinedText = word.text;
            //console.log(word);
            word.text = this.parseTextValue(combinedText);
            word.group = this.parseGroupValue(combinedText);

            const groupColor = this._getWordColor(word.group, groupCount);

			const highlight = (word.text === this.highlight) ? 'highlight' : '';
			// create element for word
			divs.push(`
				<div class="
					word-cloud-label
					word-cloud-label-${word.percent}
					${highlight}"
					style="
						font-size: ${word.fontSize}px;
						left: ${(halfSize + word.x) - (word.width / 2)}px;
						top: ${(halfSize + word.y) - (word.height / 2)}px;
						width: ${word.width}px;
						height: ${word.height}px;
                        color: ${groupColor};"
					data-word="${word.text}" 
					data-count="${word.count}">${word.text}
					</div>
				<div class="word-count-popup
				            word-count-label-${word.percent}" 
				    style="
				        font-size: ${count_font_size}px;
				        width: ${word.width}px;
						height: ${word.height}px;
						color: ${count_color};
						left: ${200}px;
						top: ${margin}px;""
						
					data-word-popup="${word.text}" 
					data-count="{word.count}">${word.count}</div>	
				`);

			
		});

		element.innerHTML = divs.join('');

		////////////////////////////////////////////////////////////////////////
    	if (wordSelected == false) {
    		console.log("drawTile(wordSelected == false");
    		const radius = 10;

    		divs.push(`
				
				<svg height="100" width="100">
					<circle cx="20" cy="20" r="${radius}" stroke="black" stroke-width="0.3" fill="red" />
				</svg>
				`);

			element.innerHTML = divs.join('');	
    	} else {
    		console.log("drawTile(wordSelected == true");
    	}
    	

    }

    onMouseOver(event){

    	const word = $(event.target).attr('data-word');
        const value = $('[data-word=' + word + ']').text();
        $('[data-word-popup=' + word + ']').show();
	}


	onMouseOut(event){

		const word = $(event.target).attr('data-word');
        const value = $('[data-word=' + word + ']').text();
        $('[data-word-popup=' + word + ']').hide();
	}

    onDblClick(event) {
		console.log('hihi');
    }

    onClick(event) {
		// un-select any prev selected words
		$('.word-cloud-label').removeClass('highlight');
		$(this.container).removeClass('highlight');
		const word = $(event.target).attr('data-word');
		if (word) {
			wordSelected = true;
			// set highlight
			this.setHighlight(word);
			// emit click event
			const plot = this.layer.plot;
			this.emit(lumo.CLICK, new lumo.ClickEvent(
				this.layer,
				getMouseButton(event),
				plot.mouseToViewPx(event),
				plot.mouseToPlotPx(event),
				word));
		} else {
			wordSelected = false;
			this.clearSelection();
		}
	}

	clearSelection() {
		console.log("clearSelection()");
		$(this.container).removeClass('highlight');
		this.highlight = null;
	}

    parseTextValue(combinedText) {
        return combinedText.split(':')[1];
    }

    parseGroupValue(combinedText) {
        return combinedText.split(':')[0];
    }

    getGroupCount(wordCounts) {
        const groups = wordCounts.map(value => {
            return parseInt(value.group, 10);
        });
        return Math.max(...groups) + 1;
    }
}

module.exports = Topic;
