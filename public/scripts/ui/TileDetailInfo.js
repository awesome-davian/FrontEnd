'use strict';

const AsynchDrilldown = require('./AsynchDrilldown');
//const template = require('../templates/TileDrildown');
const template = require('../templates/TileDrildownD3');
const $ = require('jquery');



class TileDetailInfo extends AsynchDrilldown {
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

    recomputeBodyContextTD(data) {


        var allTopics = data.all_topics; 
        var timeGraph = data.time_grath; 

     
        var usernames = [];
        var createdAt = [];
        var scores = [];

        var graphElement = [];
        


        for (var i =0; i<timeGraph.length; i++){

            var element ={};
            element.score = Math.round(timeGraph[i].score *30*10)/10 ;   
            element.date = timeGraph[i].date;

           
      /*      var alltopic = {};

            var dayTopic = allTopics[i].topics;

            
            var topicWord = topicArr.words;

            for(var i =0 ; i<dayTopic.length; i++){

              var topicArr = dayTopic[i].topic;

              for(var j =0; i<topicArr.length;j++){

                 var topicwords =topicArr[j].words;
                 var dayExWord = [];

                 for(var k =0 ; k <topicwords.lengh; k++){

                    contopicwords[k].word; 
                    

                 }

              }
            }*/

         
            element.index = i+1 ;
          
            graphElement[i] = element;


        }         

      console.log(JSON.stringify(graphElement));


       console.log(graphElement);


        this.makeGraph(data);




            

         this.model.timeGraph = graphElement;

        const c = {};

        // local model
        Object.assign(c, this.model);

        //console.log(data);

        return c;
    }

    makeQuery(tileX, tileY, tileZoom,  dateFrom){

        const c = {}; 
        c.tileX = tileX; 
        c.tileY = tileY; 
        c.tileZoom = tileZoom;
        c.dateFrom = "1383264000000";
        c.dateTo = "1385769600000"

        return c; 
    }


    show(data) {
        this.model.topic = data;

        super.show(data, {}, false);
    }

    get_coord(plotX, plotY, data){
 
        var tileX = Math.floor( plotX/ this.plot.tileSize);
        var tileY = Math.floor(plotY/this.plot.tileSize); 
        var tileZoom = Math.floor(this.plot.zoom);

        var dateFrom = $('[name=timeSlider]').val();

        var query = this.makeQuery(tileX, tileY, tileZoom,  dateFrom);

        console.log(query);
       

        super.showTileDetail(data, query, true); 
     

    }

    makeGraph(datas){

      //parse time 
       var timeGraph = datas.time_grath; 
       var allTopics = datas.all_topics; 


        var graphElement = [];

       for (var i =0; i<timeGraph.length; i++){

            var element ={};
            element.score = Math.round(timeGraph[i].score *30*10)/10 ;   
            element.date = timeGraph[i].date;
            element.alltopic =  allTopics[i].topics;

         
            element.index = i+1 ;
          
            graphElement[i] = element;

        }         
        var data =graphElement;


        var allTopics = datas.all_topics; 
        console.log(allTopics);
        var dayTopic = allTopics[3].topics;
        console.log(dayTopic);
        var exclusiveTopics = dayTopic[2].topic;
        console.log(exclusiveTopics);
        var words = exclusiveTopics[0].words; 
        console.log(words); 
        var sp_words= words[0];
        console.log(sp_words);

        console.log(allTopics[3].topics[2].topic[0]);


/*

        for (var i =0 ; i<allTopics.length; i++){

          var dayTopics = allTopics[i].topics;
          
          for(var i = 0; i<dayTopics.length; i++){

            var exclusiveTopics = dayTopics[i].topic; 


            for(var i =0; i<exclusiveTopics.length; i++){

              console.log(exclusiveTopics[i]);
            }


        
          }



        }*/

   


        var startwidth =300, startheight = 180;
        var svg = d3.select(".topic-drilldown").append("svg").style("width", 300).style("height",180),
            margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = +startwidth - margin.left - margin.right,
            height = +startheight - margin.top - margin.bottom;

        var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
        var y = d3.scaleLinear().range([height, 0]);

        var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        data.forEach(function(d){

           d.score = d.score;
           d.index = d.index;


        });


        x.domain(data.map(function(d){ return d.index;}));
        y.domain([0, d3.max(data, function(d) { return d.score; })]);




        g.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        g.append("g")
              .attr("class", "axis axis--y")
              .call(d3.axisLeft(y).ticks(10))
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", "0.71em")
              .attr("text-anchor", "end")
              .text("Frequency");

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
             .style("fill", "steelblue")
              .attr("class", "bar")
              .attr("x", function(d, i) { return x(d.index); })
              .attr("y", function(d,i) { return y(d.score);})
              .attr("width", x.bandwidth())
              .attr("height", function(d) { return height - y(d.score); })
              .on("click", function(d){

                console.log(d.alltopic);
                console.log(d.alltopic[0].topic);


                var a= d.alltopic[0].topic[0].words[1].word;

                for(var i=0 ; i<6; i ++){

                  var topic_str= '';
                  var word_str = '';

                  var wordsArr = d.alltopic[0].topic[i]

                  console.log(wordsArr);



                  for(var j=0; j<5; j++){

                    console.log(d.alltopic[0].topic[i].words[j]);

                    word_str = '';
                    //word_str+=wordsArr.words[j].word + ' ';
                    word_str+=d.alltopic[0].topic[i].words[j].word + ' ';

                  }
                  topic_str+=word_str + '\n';
                };


                console.log(topic_str);
              });
    
    }


}

module.exports = TileDetailInfo;
