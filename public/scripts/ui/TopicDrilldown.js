'use strict';

const moment = require('moment');
const AsynchDrilldown = require('./AsynchDrilldown');
const template = require('../templates/TopicDrilldown');
const $ = require('jquery');


function getFriendlyDate(unix_time) {
  return moment.utc(unix_time).format('MMM Do YYYY');
}

class TopicDrilldown extends AsynchDrilldown {
    constructor(name, plot, dataset, esEndpoint, esIndex) {
        super(name, dataset, esEndpoint, esIndex);
        this._dataset = dataset;
        this._currentNodeId = null;
        this.plot = plot;
        this.model = {};
    
    }

    getBodyTemplate() {

        return template;

    }

    recomputeBodyContext(data) {

        if(typeof data ==='string'){
                // console.log('string');
            }
        else{
               var documents = data.documents; 

               //var userName = documents.userName;
            
               var usernames = [];
               var createdAt = [];
               var texts = [];

               var tweet = [];
               var tweetTimes =[];

              for (var i =0; i<documents.length; i++){

                    
                    var readable_time = getFriendlyDate(documents[i].created_at * 1000);
                    //console.log('created_at: ' + documents[i].created_at);
                   // console.log('readable_time: ' + readable_time);

                    usernames[i] =  documents[i].username;
                    createdAt[i] =  readable_time;
                    texts[i] =documents[i].text;

                    var tweetData ={};
                    tweetData.username = documents[i].username;
                    // tweetData.createdAt = documents[i].created_at;
                    tweetData.created_at = readable_time;
                    tweetData.texts= documents[i].text;

                    tweet[i] =tweetData;

                    tweetTimes[i] = readable_time;
               };


               this.model.tweets = tweet;

              // this.makeGraph(tweetTimes);

            }



        // console.log(data);
        const c = {};
        // local model
        Object.assign(c, this.model);

        // console.log(c);

        return c;
    }

    makeQuery(tileX, tileY, tileZoom, data, date){

        const c = {}; 
        c.tileX = tileX; 
        c.tileY = tileY; 
        c.tileZoom = tileZoom;
        c.word = data;
        c.date = date;

        return c; 
    }


    show(data) {
        this.model.topic = data;

        //console.log(this.model);

        super.show(data, {}, false);
    }

    get_coord(plotX, plotY, data){
 
        this.model.topic = data;
        var tileX = Math.floor( plotX/ this.plot.tileSize);
        var tileY = Math.floor(plotY/this.plot.tileSize); 
        var tileZoom = Math.floor(this.plot.zoom);

        var date = $('[name=timeSlider]').val();

        var query = this.makeQuery(tileX, tileY, tileZoom, data, date);
       
        //console.log(query);

        super.show(data, query, true); 
      // super.fetchDataAsynch(query);
      

    }


    onShowTweetbyTime(){

        console.log('show');

    }

    makeGraph(data){

      var documents = data.documents; 
      var tweetTimes =[];

      console.log(data);

      var timeGraph =data.timeGraph;
      var tweetByTime = [];

      for(var i=0; i<21; i++){

        var element = {};
        element.day = 20+i;
        element.nmb = timeGraph[20+i];
        if(20+i>31){
          element.day =i-11;
          element.nmb = timeGraph[i-11];
        };
        tweetByTime[i] = element;
      };

      /* for(var i=0; i<30; i++){

        var element = {};
        element.day = i+1;
        //element.nmb = 0;
       
        element.nmb =timeGraph[i+1];
        
        tweetByTime[i] = element;
      };
 
      console.log(tweetByTime);
  */
   

      for (var i =0; i<documents.length; i++){
                  
        var readable_time = getFriendlyDate(documents[i].created_at * 1000);
        tweetTimes[i] = readable_time;
      };

      //console.log(tweetTimes);

  /*    var uniqueCount = tweetTimes.sort();

      var  count = {}; 

      uniqueCount.forEach(function(i) { count[i] = (count[i]||0)+1;  });

      console.log(count);
*/
     /* var sortedData = [];
      var idx=0;
      for(var key in count){

        var element = {};
        element.day = key;
        element.nmb = count[key];
        sortedData[idx] = element; 
        idx +=1; 
      }

      console.log(sortedData);*/

      var startwidth =290, startheight = 180;
      var svg = d3.select(".drilldown-graph").append("svg").style("width", 290).style("height",180),
          margin = {top: 20, right: 20, bottom: 30, left: 40},
          width = +startwidth - margin.left - margin.right,
          height = +startheight - margin.top - margin.bottom;

      var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
      var y = d3.scaleLinear().range([height, 0]);
      var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(tweetByTime.map(function(d){ return d.day;}));
      y.domain([0, d3.max(tweetByTime, function(d) { return d.nmb; })]);

      var axis = 

      g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x).ticks(6).tickValues([20,25,30,5,9]));
       //.call(d3.axisBottom(x).ticks(7).tickValues([1,5,10,15,20,25,30]));
      // .call(d3.axisBottom(x));



      g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(5))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end");

       g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 -(margin.left/4*3))
        .attr("x", 0 -(height/2))
        .style("text-anchor", "middle")
        .style("font-size",14)
        .text("Frequency")
        .attr("fill","white");


      g.selectAll(".bar")
          .data(tweetByTime)
          .enter().append("rect")
           .style("fill", "white")
            .attr("class", "bar")
            .attr("x", function(d, i) { return x(d.day); })
            .attr("y", function(d,i) { return y(d.nmb);})
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.nmb); });


       g.selectAll(".domain").attr("stroke","white");
       g.selectAll(".domain").attr("stroke","white");



  




    }


    
}

module.exports = TopicDrilldown;
