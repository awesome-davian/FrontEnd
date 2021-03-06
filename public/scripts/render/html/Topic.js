'use strict';

const _ = require('lodash');
const veldt = require('veldt');
const $ = require('jquery');
const Transform = require('../transform/Transform');
const lumo = require('lumo');
const d3 = require('d3');


const VERTICAL_OFFSET = 24;
const HORIZONTAL_OFFSET = 0;
const NUM_ATTEMPTS = 1;
let wordSelected = false;

var tileIdx = 0; 
var dictionary = [];
var tileLevel = 10;

const topicColor = ['#ffffff', '#ff3c82', '#89c541', '#fee801'];
//const topicColor = ['#e0e0e0', '#E53B51', '#76ff03', '#ffEb3b'];
const glyphColor = ['#19b296', '#ef562d'];
//const glyphColor = ['#00e5ff', '#ff8357']
const glyphBackgroundColor = ['#9e9e9e', '#bdbdbd'];


/**
 * Given an initial position, return a new position, incrementally spiralled
 * outwards.
 */

const sigmoid = function(x){
    	return 1/(1+ Math.pow(Math.E, -(x)));
};

const spiralPosition = function(pos) {
	const pi2 = 2 * Math.PI;
	const circ = pi2 * pos.radius;
	const inc = (pos.arcLength > circ / 10) ? circ / 10 : pos.arcLength;
	const da = inc / pos.radius;
	let nt = (pos.t + da);
	if (nt > pi2) {
		nt = nt % pi2;
		pos.radius = pos.radius + pos.radiusInc;
	}
	pos.t = nt;
	pos.x = pos.radius * Math.cos(nt);
	pos.y = pos.radius * Math.sin(nt);
	return pos;
};


const softmax = function (arr) {
    return arr.map(function(value,index) { 
      return Math.exp(value) / arr.map( function(y /*value*/){ return Math.exp(y) } ).reduce( function(a,b){ return a+b })
    })
}

const Softmax = function (Xdata){
  var Explist=Xdata.map(Math.exp);
  var Sum=Explist.reduce(function(a, b) {
  return a + b;});
  var SoftmaxData= Explist.map(function(d){return d/Sum});
  return SoftmaxData;
}




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

const getMouseButton = function(event) {
	if (event.which === 1) {
		return 'left';
	} else if (event.which === 2) {
		return 'middle';
	} else if (event.which === 3) {
		return 'right';
	}
};

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

	let angle = 360 / (groupCount - 1);
	let margin = 30;
	let movingAngle = 30;
	
	let start = (pi2 / (groupCount-1))*(groupIndex-1);
	let end = (pi2 / (groupCount-1))*(groupIndex); 
	
	// detail adjustment according to the group count
	if (groupCount === 4) {
		
		// moving basis
		start += ((circ/360)*(angle+10))/pos.radius;
		end += ((circ/360)*(angle-10))/pos.radius;

		if (groupIndex === 3) {
			// set additional margin for last group
			start -= ((circ/360)*margin)/pos.radius;
			end -= ((circ/360)*margin)/pos.radius;
		}	

	} else if (groupCount === 3) {

		// moving basis
		start += ((circ/360)*(angle-90+20))/pos.radius;
		end += ((circ/360)*(angle-90-20))/pos.radius;

	} else if (groupCount == 2) {

		margin = 50;
	}
	
	let center = (start + end)/2;

	const inc = (pos.arcLength > circ / movingAngle) ? circ / movingAngle : pos.arcLength;
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

const createWordCloud = function(renderer, words, extrema) {
	const tileSize = renderer.layer.plot.tileSize;
	const boundingBox = {
		width: tileSize - HORIZONTAL_OFFSET * 2,
		height: tileSize - VERTICAL_OFFSET * 2,
		x: 0,
		y: 0
	};
	const cloud = [];
	words = sortWords(words);
	// measure the words size
	words = measureWords(renderer, words, extrema);

	// assemble word cloud
	words.forEach(wordCount => {
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
			is_first: 1
		};
		//console.log(words);

		// const length= words.length;
		
		const groups = words.map(value => {
            return parseInt(value.group, 10);
        });
        const groupCount = Math.max(...groups) + 1;
        // const topicCount = length/groupCount;

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
		
        const words = _.flatMap(tile.data.topic, (value, key) => {
        	
            return _.map(value.words, (weight, word) => {
    			return {
    				// text: key + ':' + word,
					text: word,
    				count: weight,
                    group: key
    			};
    		});

        });

        const scores  = _.flatMap(tile.data.topic, (value, key) =>{
        	return value.score;
        });
		// console.log(words);

        const groupCount = this.getGroupCount(words);
		const layer = this.layer;
		const extrema = layer.getExtrema(tile.coord.z);
		// genereate the cloud
		const cloud = createWordCloud(this, words, extrema);
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

		var totWordCount = 0;

		const glyphCircleRadius = Math.atan(totWordCount/100)*10
    	const spatialScore  = tile.data.glyph.spatial_score;
    	const temportalScore = tile.data.glyph.temporal_score;
     

		cloud.forEach(word => {
            const combinedText = word.text;
            //console.log(word);
            word.text = this.parseTextValue(combinedText);
            word.group = this.parseGroupValue(combinedText);

            const groupColor = this._getWordColor(word.group, groupCount);

			const highlight = (word.text === this.highlight) ? 'highlight' : '';
			// create element for word

			const wordRadius = sigmoid(word.count)*15;
			//console.log(wordRadius);
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
                    data-spatialscore = ${spatialScore}
					data-temporalScore = ${temportalScore}
					data-totWordCount = ${totWordCount}
					data-tileidx = ${tileIdx}
					data-word="${word.text}" 
					data-group="${word.group}"
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
				<div class="word-glyph-popup
				            word-glyph-popup-${word.text}-${word.group}" 
				           style = "
				                top : ${20}px;
				                right : ${20}px;
				                width : ${100}px;
				                height : ${100}px;
				                float: right;
				                display : none;
				                ">						            		
				</div>	
				`);	
		    totWordCount += word.count;	

				
			});

		var radius = 0;

		if(totWordCount == 0){

			radius = 0 
		}
		else{
			radius = totWordCount/200
		};


		//console.log(totWordCount);


		const glyphRadius = Math.atan(totWordCount/120)*10
		//console.log(glyphRadius);
		//const glyphRadius = (sigmoid(totWordCount/300)-0.5)*30; 

    	if(totWordCount > 0){

	    	divs.push(`
					<div class='tile-glyph-${tileIdx} tile-glyph'
					    style = '
					        right: ${200}px;
					        top : ${margin}px;
					        width: ${256}px;
					        height: ${256}px;
					        float : left;
					        '
					        data-coordx = ${tile.coord.x}
					        data-coordy = ${tile.coord.y}
					        data-spatialScore = ${spatialScore}
						    data-temporalScore = ${temportalScore}
						    data-totwordcount = ${totWordCount}>
					    <svg height='256' width='256' id = 'tileBoarder' class = 'tileBoarder-${tileIdx}'
						    >
						</svg>
					</div>	
					`);
        }/* else {
        	divs.push(`
					<div class='tile-glyph-${tileIdx} tile-glyph'
					    style = '
					        right: ${200}px;
					        top : ${margin}px;
					        width: ${256}px;
					        height: ${256}px;
					        float : left;
					        '
					        data-coordx = ${tile.coord.x}
					        data-coordy = ${tile.coord.y}>
					    <svg height='256' width='256'
						    >
						</svg>
					</div>	
					`);
        }*/


//	<circle cx='40' cy='40' r='${glyphRadius}' fill='#efcec5' />
		element.innerHTML = divs.join('');

        tileIdx++;

		////////////////////////////////////////////////////////////////////////
    	if (wordSelected == false) {
	
    		// console.log(tile.data.glyph);
    		//const radius = 10;
    		//const radius = Math.floor(tile.data.glyph.spatial_score * 10);
    		const glyphCircleRadius = Math.atan(totWordCount/100)*12

    	} else {
    		//console.log("drawTile(wordSelected == true");
    	}



    	//console.log(spatialScore);
    	//console.log(temportalScore);

    	var tempScore = 0;

        if(temportalScore < 75){

        	tempScore = temportalScore;

        } else if(temportalScore >= 75 && temportalScore < 300){
        	tempScore = temportalScore /2;
        }else if(temportalScore >= 300 && temportalScore < 1000) { 
        	 tempScore = temportalScore/ 3;
        } else if(temportalScore >= 1000){
        	tempScore = temportalScore / 4;
        } else {
        	tempScore =temportalScore;
        }

        tempScore = Math.atan(tempScore/100)*0.5;

        //console.log(tempScore);

       var date = $('[name=timeSlider]').val();





    	var temp = new Object();
    	temp.tileIdx = tileIdx;
    	temp.spatialScore = spatialScore;
    	temp.temportalScore = tempScore;
    	//temp.topicScore  = ['0.2', '0.3', '0.3', '0.2'];
    	temp.topicScore = scores;
    	temp.glyphRadius = glyphRadius;
    	temp.coord = tile.coord.z
    	temp.date = date;

    	dictionary.push(temp);

    	tileLevel = tile.coord.z

    	//console.log(dictionary);


    }

    onMouseOver(event){

    	var date = $('[name=timeSlider]').val();


    	const temportalScore = $(event.target).attr('data-temporalScore');
        const spatialScore = $(event.target).attr('data-spatialscore');
        const totWordCount = $(event.target).attr('data-totwordcount');
        const tileIdx = $(event.target).attr('data-tileidx');
        
    	const word = $(event.target).attr('data-word');
        const value = $('[data-word=' + word + ']').text();
        const wordCount = $(event.target).attr('data-count');

        var width = 256,
            height = 256,
            radius = Math.min(width, height) / 2;

        var arcWidth = 5,
            arcPad =0.5,
            arcMin = 17; 

        var drawArc = d3.arc()
                        .innerRadius(function(d,i){
                         return arcMin + i*(arcWidth) +arcPad;
                        })
                        .outerRadius(function(d,i){
                         return arcMin + (i+1)*(arcWidth);
                        })
                       .startAngle(function(d,i){
                       	    if(i%2==0){return 0.1}
                       	    else{return 2*Math.PI  + 0.1}
                       })
/*                        .endAngle(function(d,i){
                            if(i%2==1){return d.score*360*0.0175}
                            else{return 2*Math.PI - d.score*360*0.0175}
                        });*/


        var pie = d3.pie()
                 .sort(null)
                 .startAngle(0.1 * Math.PI)
                 .endAngle(2.1 * Math.PI)
                 .padAngle(0.1)
                 .value(function(d) {
                        return d.score;
                    });

        //movebackword

        d3.selection.prototype.moveToBack = function() { 
			return this.each(function() { 
		        var firstChild = this.parentNode.firstChild; 
		        if (firstChild) { 
		            this.parentNode.insertBefore(this, firstChild); 
		        } 
		    }); 
		};
        


        if(d3.select("#wordGlyph-"+tileIdx).empty() && wordSelected == false && !isNaN(tileIdx))
        {    
/*        	var arr_values = new Array();
        	var temp = new Array();*/
        	var totcnt = 0;
/*        	for (var i =0; i< dictionary.length; i++){
        		arr_values.push(dictionary[i].spatialScore)
        	}
        	console.log(arr_values)
        	temp = Softmax(arr_values)
        	console.log(temp);*/

        	var tile = {};
        	var tiledict = [];

        	for(var i = 0; i< dictionary.length; i++){
/*        		if(dictionary[i].spatialScore < 10){
        			totcnt += 0;
        		} else {
	        		//totcnt += Math.log10(Math.pow(dictionary[i].spatialScore,3));
	        		//console.log(Math.log10(Math.pow(dictionary[i].spatialScore, 3)));
	        		totcnt += Math.atan(dictionary[i].spatialScore / 500);
	        		//console.log(Math.atan(dictionary[i].spatialScore / 500));
	        	}
*/
/*	        	var temp = new Object();
	        	temp.idx = dictionary[i].tileIdx;
	        	temp.spatialScore = dictionary[i].spatialScore;
	        	tiledict.push(temp);*/

	        	if(dictionary[i].coord == tileLevel && dictionary[i].date === date){
	        		tile[dictionary[i].tileIdx] = dictionary[i].spatialScore;
	        	}

        	}

        	console.log(tile)
        	var values = Object.values(tile);
        	//console.log(values)
        	var sortedValues = values.sort(function(a,b) {return b - a });
        	var unique = sortedValues.filter(function(elem, index, self) {
			    return index == self.indexOf(elem);
			})
        	console.log(unique);


/*        	var sortedArr = [];
        	for (var i = 0; i < sortedValues.length; i ++){
        		for (var key in values){
        			if(tile[key] === sortedValues[i]){
        				sortedArr.push(key);
        				if(tile[key] === 0){
        					break;
        				}
        			}
        		}

        	}

        	console.log(sortedArr);


*/




            console.log(dictionary);


        	for(var i = 0; i < dictionary.length; i++){

 /*       	    if(dictionary[i].temportalScore > 0.5 && dictionary[i].temportalScore < 0.6){

		        	dictionary[i].temporal_score *= 2/3  

		        } else if(dictionary[i].temportalScore >= 0.6 && dictionary[i].temportalScore <0.75){
		        	tileBoarderWidth = 2
		        }else if(dictionary[i].temportalScore >= 0.75 && dictionary[i].temportalScore < 0.9) { 
		        	 = 4
		        } else if(dictionary[i].temportalScore >= 0.9){
		        }*/

/*		        if(dictionary[i].spatialScore < 10 ){

		        	dictionary[i].spatialScore = 0;
		        } else {
		           // dictionary[i].spatialScore = Math.log10(Math.pow(dictionary[i].spatialScore, 3 ))/ totcnt;
		            dictionary[i].spatialScore =  Math.atan(dictionary[i].spatialScore / 500)/ totcnt;
		         }		        
		        console.log(dictionary[i].spatialScore);*/

	        	
	        	var data = [
					          { score: dictionary[i].temportalScore , color: glyphColor[0]}
					        ];

			    var topicScoreData = 
			    [
                    {score: dictionary[i].topicScore[0], color: topicColor[0], radius:dictionary[i].glyphRadius},
                    {score: dictionary[i].topicScore[1], color: topicColor[1], radius:dictionary[i].glyphRadius},
                    {score: dictionary[i].topicScore[2], color: topicColor[2], radius:dictionary[i].glyphRadius},
                    {score: dictionary[i].topicScore[3], color: topicColor[3], radius:dictionary[i].glyphRadius}
			    ];

	        	var svg2 = d3.select(".tile-glyph-"+i).select("svg")
	                 .attr("width", width)
	                 .attr("height", height)
	                 .append("g")
	                 .attr("id", "wordGlyph-"+i)
	                 .attr("class", "wordGlyph")
	                 .attr("transform", "translate(" + 50+ "," + 40 + ")");

		        var g = svg2.selectAll(".arc")
		               .data((data))
		               .enter().append("g")
		               .attr("class", "arc")
		               .attr("id", "wordGlypgArc-"+tileIdx);

		        var boundCirclre = d3.select(".tile-glyph-"+i).select("svg")
		                            .append("circle")
		                            .attr("id", "wordGlyph-" + i)
		                            .attr("class", "wordGlyph")
		                            .attr("cx", 50)
		                            .attr("cy", 40)
		                            .attr("r", 20)
		                            .style("fill", "none")
		                            .attr("stroke-width", 0.5)
		                            .attr("stroke", "#BDBDBD");

		        var g2 = svg2.selectAll(".piechar")
		                 .data(pie(topicScoreData))
		                 .enter().append("g")
		                 .attr("class", "piechart")

		        var tileBoarderWidth = 0;
		        var boardercolor = '#EF9A9A'

		        if(dictionary[i].coord === 10){

		        	if(dictionary[i].spatialScore === parseInt(unique[0])){
		        		tileBoarderWidth = 2;
		        		boardercolor = '#D84315';

		        	} else if(dictionary[i].spatialScore === parseInt(unique[1])){
		        		tileBoarderWidth = 1;
		        		boardercolor = '#F4511E';
		        	}
		        } else if(dictionary[i].coord === 11){

		        	if(dictionary[i].spatialScore === parseInt(unique[0])){
		        		tileBoarderWidth = 2;
		        		boardercolor = '#D84315';
		        	} else if(dictionary[i].spatialScore === parseInt(unique[1]) || dictionary[i].spatialScore === parseInt(unique[2])){
		        		tileBoarderWidth = 1;
		        		boardercolor = '#F4511E';
		        	}
		        } else if(dictionary[i].coord === 12){

		        	if(dictionary[i].spatialScore === parseInt(unique[0])){
		        		tileBoarderWidth = 3;
		        		boardercolor = '#D84315';
		        	} else if(dictionary[i].spatialScore === parseInt(unique[1]) || dictionary[i].spatialScore === parseInt(unique[2])){
		        		tileBoarderWidth = 2;
		        		boardercolor = '#F4511E';
		        	} else if(dictionary[i].spatialScore === parseInt(unique[3]) || dictionary[i].spatialScore === parseInt(unique[4])){
		        		tileBoarderWidth = 1;
		        		boardercolor = '#FF7043';
		        	}
		        } else if(dictionary[i].coord === 13){

		        	if(dictionary[i].spatialScore === parseInt(unique[0])){
		        		tileBoarderWidth = 3;
		        		boardercolor = '#D84315';

		        	} else if(dictionary[i].spatialScore === parseInt(unique[1]) || dictionary[i].spatialScore === parseInt(unique[2])){
		        		tileBoarderWidth = 2;
		        		boardercolor = '#F4511E';
		        	} else if(dictionary[i].spatialScore === parseInt(unique[3]) || dictionary[i].spatialScore === parseInt(unique[4]) || dictionary[i].spatialScore === parseInt(unique[6])){
		        		tileBoarderWidth = 1;
		        		boardercolor = '#FF7043';
		        	}else if(dictionary[i].spatialScore === parseInt(unique[6]) || dictionary[i].spatialScore === parseInt(unique[7]) || dictionary[i].spatialScore === parseInt(unique[8])){
		        		tileBoarderWidth = 0.5;
		        		boardercolor = '#FF8A65';
		        	}
		        }

/*		        if(dictionary[i].spatialScore > 0.03 && dictionary[i].spatialScore < 0.07){

		        	tileBoarderWidth = 0.5;
		        	boardercolor = '#EF9A9A' 

		        } else if(dictionary[i].spatialScore >= 0.08 && dictionary[i].spatialScore <0.1){
		        	tileBoarderWidth = 1;
		        	boardercolor = '#EF5350'
		        }else if(dictionary[i].spatialScore >= 0.1 && dictionary[i].spatialScore < 0.15) { 
		        	tileBoarderWidth = 1.5
		        	boardercolor = '#E53935'
		        } else if(dictionary[i].spatialScore >= 0.15 && dictionary[i].spatialScore < 0.17){
		        	tileBoarderWidth = 2
		        	boardercolor = '#B71C1C'
		        }else if(dictionary[i].spatialScore >= 0.17 && dictionary[i].spatialScore < 0.19){
		        	tileBoarderWidth = 2.5
		        	boardercolor = '#B71C1C'
		        }   else if(dictionary[i].spatialScore >= 0.19){
		        	tileBoarderWidth = 4
		        	boardercolor = '#B71C1C'
		        }*/

               //if(d3.select("#boarder-"+tileIdx).empty())
               {

   		        	var boarder = d3.select('.tileBoarder-'+i)
	                .append("rect")
	                .attr("id", "boarder-"+ i)
	                .attr("class", "boarder")
	                .attr("width", 254)
	                .attr("height", 254)
	                .style("fill", "none")
	                .attr("stroke", boardercolor)
	                .attr("stroke-width", tileBoarderWidth);

               }



		        var pieChart = d3.arc()
	                .innerRadius(function(d){
	                	if(d.data.radius <7 ){		
	                		return 0;
	                	}else if(d.data.radius>=7 && d.data.radius <12){
	                		return 2.5;
	                	} else {
	                		return 5 ;
	                	}
	                })
	                .outerRadius(function(d){
	                	return d.data.radius
	                });


		        g2.append("path")
		          .style("fill", function(d,i){
		          	return topicScoreData[i].color
		          })        
                  .transition().delay(function(d,i){ return i*100;}).duration(400)
                  .attrTween('d', function(d){
                  	var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                  	return function(t){
                  		d.endAngle = i(t);
                  		return pieChart(d)
                  	}
                  });




		        g.append("path")
		         .style("fill", function(d,i) {
		             return d.color
		          })
		         .transition().delay(function(d, i) { return i * 500; }).duration(750)
		         .attrTween('d',function(d,i){
		         	 if(i%2==0){var interp = d3.interpolate(0.1 , d.score*360*0.0175 + 0.1)}
		         	 else{var interp = d3.interpolate(2*Math.PI + 0.1, 2*Math.PI - d.score*360*0.0175 +0.1)}
			         return function(t){
			             d.endAngle = interp(t);
			             return drawArc(d,i);
			            };

	              });
  

		     g.moveToBack();
		     g2.moveToBack();

	        }





        }





           	

	}


	onMouseOut(event){

		const word = $(event.target).attr('data-word');
        const value = $('[data-word=' + word + ']').text();
        //$('[data-word-popup=' + word + ']').hide();
        //$('.word-glyph-popup-'+word).hide();

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

			d3.selectAll("circle").attr("opacity", 0.5);
	    	d3.selectAll("path")
		      .transition()
		      .attr("opacity", 0.5);


		    d3.selectAll(".wordGlyph").transition()
		       .attr("opacity", 0.5);

		    d3.selectAll(".boarder").transition()
		       .attr("opacity", 0.5);

			console.log('[UB] A word clicked: ' + word);
		} else {
			wordSelected = false;
			d3.selectAll("circle").attr("opacity", null);
		    d3.selectAll("path")
		      .transition()
			  .attr("opacity", null);	


			 d3.selectAll(".wordGlyph").transition()
		       .attr("opacity", null);		
			//this.clearSelection();

             

		}
	}

	clearSelection() {
		// console.log("clearSelection()");
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