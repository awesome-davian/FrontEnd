'use strict';

const _ = require('lodash');
const veldt = require('veldt');
const $ = require('jquery');
const Transform = require('../transform/Transform');
// const lumo = require('lumo');
const d3 = require('d3');


const VERTICAL_OFFSET = 24;
const HORIZONTAL_OFFSET = 0;
const NUM_ATTEMPTS = 1;

var tileIdx = 0;
var dictionary = [];



const scaleTFIDF = function(temporal) {

    for(var i = 0; i < temporal.length; i++){

        console.log(temporal[i])

        if(temporal[i] < 3){
            temporal[i] = 0
        } else if(temporal[i] >= 3 && temporal[i] < 3.5){
            temporal[i] = 1
        } else if(temporal[i] >= 3.5 && temporal[i] < 4){
            temporal[i] = 2
        } else if(temporal[i] >= 4 && temporal[i] < 4.5){
            temporal[i] = 3
        } else if(temporal[i] >= 4.5 && temporal[i] <5.5){
            temporal[i] = 4
        } else if(temporal[i] >= 5.5 && temporal[i] <6.5){
            temporal[i] = 5
        } else if(temporal[i] >= 6.5){
            temporal[i] = 6
        } else{
            temporal[i] = 6
        }

    }
   
    return temporal;
};



class WordGlyph extends veldt.Renderer.HTML.CommunityLabel {
    constructor(options = {}) {
        super(options);
    }

    drawTile(element, tile) {

       // console.log(tile);

        const score = tile.data.score;
        const percent = tile.data.percent;
        const temporal = tile.data.temporal;

        //console.log(score);

        const margin = 5;
        //const radius = Math.floor(frequency/100);
        const radius = Math.atan(score/100)*12;


        const divs = [];

        if(score > 5){

            divs.push(`
                <div class="word-glyph word-glyph-${tileIdx}"
                    style="
                        right: ${200}px;
                        top : ${margin}px;
                        width: ${256}px;
                        height: ${256}px;
                        float : right;
                        ">
                    <svg height="256" width="256"
                        data-radius = "${radius}"
                        data-percent =  "${percent}"
                        data-temporal = "${temporal}"
                        data-tileidx = "${tileIdx}"
                        data-score ="${score}">
                        <circle cx="205" cy="40" r="${radius}"  fill="#4DD0E1" />
                        <circle r="23" cx="205" cy="40" fill="none" stroke="#e0e0e0" stroke-width="2"/> 
                    </svg>
                </div>
                <div class = "Tile Tile-${tileIdx}"
                    data-tileIdx = "${tileIdx}"
                    style = "
                        width : ${256}px;
                        height : ${256}px; 
                    ">
                </div>
            `);
        };


        element.innerHTML = divs.join('');

        tileIdx++;

        console.log(temporal)

        var scaledtemporal = scaleTFIDF(temporal)

        console.log(scaledtemporal);

        var temp = new Object();
        temp.tileIdx = tileIdx;
        temp.temporal = scaledtemporal;
        temp.percent = percent;
        temp.score = radius/15;

        dictionary.push(temp);
    }

    onMouseOver(event){

        const score = $(event.target).attr('data-score');
        const percent = $(event.target).attr('data-percent');
        const wordRadius = $(event.target).attr('data-radius');
        const temporal = $(event.target).attr('data-temporal');
        const tileId = $(event.target).attr('data-tileidx');

        // console.log(frequency);
        // console.log(percent);
        // console.log(temporal);

        var width = 256,
            height = 256,
            radius = Math.min(width, height) / 2;

        var arcMin = 20, 
            arcWidth = 5,
            arcPad =0.5;     


        var drawArc = d3.arc()
                        .innerRadius(function(d,i){
                         return arcMin + i*(arcWidth) +arcPad;
                        })
                        .outerRadius(function(d,i){
                         return arcMin + (i+1)*(arcWidth);
                        })
                        .startAngle(0)
                        // .endAngle(function(d,i){
                        //   return d.score*360*0.0175
                        // });

        var pie = d3.pie()
                 .sort(null)
                 .value(function(d) {
                        return d.score;
                    });


       if(d3.select("#wordGlyphArc").empty()){

            for(var i = 0; i<dictionary.length; i++){

                var data = [
                              { score: dictionary[i].percent , color: '#D50000'}
                           ];

                var svg2 = d3.select(".word-glyph-"+ i).select("svg")
                             .attr("width", width)
                             .attr("height", height)
                             .append("g")
                             .attr("transform", "translate(" + 205 + "," + 40 + ")");

                var g = svg2.selectAll(".arc")
                            .data((data))
                            .enter().append("g")
                            .attr("class", "arc")
                            .attr("id", "wordGlyphArc");

                g.append("path")
                    .style("fill", function(d,i) {
                        return d.color;
                    })
                    .transition().delay(function(d, i) { return i * 500; }).duration(1000)
                    .attrTween('d',function(d,i){
                        var interp = d3.interpolate(0, d.score*360*0.0175)
                        return function(t){
                            d.endAngle = interp(t);
                            return drawArc(d,i);
                        };
                    });


                console.log(dictionary[i].temporal)


                //var temportalData = [1 ,2, 3, 4, 5, 6, 0];
                var colors = ['#FBE9E7', '#FFAB91', '#FF7043', '#F4511E', '#E64A19', '#D84315', '#FFB74D'];

                var sqareDim = 10; 

                var svgTemporal = d3.select(".word-glyph-"+ i)
                             .select("svg")
                         .attr("width", width)
                         .attr("height", height);


                var shape = svgTemporal.selectAll(".shapes")
                                .data(dictionary[i].temporal).enter();

                if (shape.select("rect").empty()){

              shape.append("rect")
                 .attr("x", 241)
                 .style("fill", function(d,i) {
                    return colors[d];
                  })
                 .transition()
                 .duration(500)
                 .delay(function (d, i) {
                     return i * 300;
                 })
                 .attr("y", function(d,i){ return 7+(i)*10; })
                 .attr("width",8)
                 .attr("height",8);   
                }

             }


        var boarder = d3.selectAll(".word-glyph").select("svg")
                       .attr("width", width)
                       .attr("height", height)
                       .append("rect")
                       .attr("width", 256)
                       .attr("height", 256)
                       .style("fill", "none")
                       .attr("stroke", "#DD2C00")
                       .attr("stroke-width",2);
       }


      



    }


    onClick(event) {

        const wordGlyph = $(event.target).attr('data-score');
        
        // if (wordGlyph != null)
        //     console.log('[I][' + (new Date()).toLocaleTimeString() + '] word clicked: ' + wordGlyph.word);
    }

}

module.exports = WordGlyph;