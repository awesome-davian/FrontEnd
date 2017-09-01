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

class WordGlyph extends veldt.Renderer.HTML.CommunityLabel {
    constructor(options = {}) {
        super(options);
    }

    drawTile(element, tile) {

        //console.log(tile);

        const frequency = tile.data.frequency;
        const tfidf = tile.data.tfidf;
        const temporal = tile.data.temporal;

        const margin = 5;
        //const radius = Math.floor(frequency/100);
        const radius = Math.atan(frequency/100)*12;

        const divs = [];

        if(frequency > 10){

          divs.push(`
              <div class="word-glyph word-glyph-${tileIdx}"
                   style = "
                        right: ${200}px;
                        top : ${margin}px;
                        width: ${100}px;
                        height: ${100}px;
                        float : right;
                        " >                 
              <svg height="100" width="100"
                        data-radius = "${radius}"
                        data-tfidf =  "${tfidf}"
                        data-temporal = "${temporal}"
                        data-frequency ="${frequency}">
                 <circle cx="50" cy="40" r="${radius}"  fill="#4DB6AC" />
                 <circle r="18" cx="50" cy="40" fill="none" stroke="#bdbdbd" stroke-width="2"/> 
              </svg>
            </div>
            `);

      };

        


        element.innerHTML = divs.join('');

        tileIdx++;

        var temp = new Object();
        temp.tileIdx = tileIdx;
        temp.temporal = temporal;
        temp.tfidf = tfidf;

        dictionary.push(temp);
       
    }

    onMouseOver(event){

        const frequency = $(event.target).attr('data-frequency');
        const tfif = $(event.target).attr('data-tfidf');
        const wordRadius = $(event.target).attr('data-radius');
        const temporal = $(event.target).attr('data-temporal');

      /*  console.log(frequency);
        console.log(tfif);
        console.log(temporal);*/

        //var svg = d3.select(".word-glyph-"+frequency).append("svg").attr("width",100).attr("height",100);
        // svg.append("circle").attr("cx",50).attr("cy",40).attr("r",wordRadius)
        //    .style("fill","#4DB6AC");
    


        var width = 100,
            height = 100,
            radius = Math.min(width, height) / 2;

        var arcMin = 15, 
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

        if(d3.select(svg2).empty()){

          for(var i = 0; i<dictionary.length; i++){

            var data = [
                         { score: 0.8 , color: '#f8b70a'}
                       ];

            var svg2 = d3.select(".word-glyph-"+ i).select("svg")
                         .attr("width", width)
                         .attr("height", height)
                         .append("g")
                         .attr("transform", "translate(" + 50+ "," + 40 + ")");

            var g = svg2.selectAll(".arc")
                        .data((data))
                        .enter().append("g")
                        .attr("class", "arc");

            g.append("path")
             .style("fill", function(d,i) {
               return d.color;
              })
             .transition().delay(function(d, i) { return i * 500; }).duration(500)
             .attrTween('d',function(d,i){
                var interp = d3.interpolate(0, d.score*360*0.0175)
                return function(t){
                  d.endAngle = interp(t);
                  return drawArc(d,i);
              };
             });


        var temportalData = [1 ,2, 3, 4, 5, 6, 7];
        var colors = ['#E65100', '#Ef6C00', '#F57C00', '#FB8C00', '#FF9800', '#FFA726', '#FFB74D'];

        var sqareDim = 10; 

        var svgTemporal = d3.select(".word-glyph-"+ i)
                     .select("svg")
                 .attr("width", width)
                 .attr("height", height);


        
        var shape = svgTemporal.selectAll(".shapes")
                        .data(temportalData).enter();

        if (shape.select("rect").empty()){

          shape.append("rect")
             .attr("x", 85)
             .style("fill", function(d,i) {
                 return colors[i];
              })
             .transition()
             .duration(400)
             .delay(function (d, i) {
                 return i * 300;
             })
             .attr("y", function(d,i){ return 7+(i)*10; })
             .attr("width",8)
             .attr("height",8);   
        }

      }
    }


       



    }


    onClick(event) {

        const wordGlyph = $(event.target).attr('data-frequency');
        console.log(wordGlyph);
     

   
    }

}

module.exports = WordGlyph;