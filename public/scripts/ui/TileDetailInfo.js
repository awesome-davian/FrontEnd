'use strict';

const AsynchDrilldown = require('./AsynchDrilldown');
const SliderGTRA = require('./SliderGTRA');
//const template = require('../templates/TileDrildown');
const template = require('../templates/TileDrildownD3');
const $ = require('jquery');


function _getWordColor(group) {
    const colorJump = Math.floor(255/5  + 1);
    const colorGroup = group % 5;


    const colors = ['FF', 'FF', 'FF'];
    const colorAdjustment = colorJump * (Math.floor(group / 5) + 1);
    colors[colorGroup] = ('00' + (255 - colorAdjustment)
        .toString(16)).substr(-2).toUpperCase();

    const colormap = ['ffffff','ff3c82','89c541','fee801','b93cff'];

    //return '#' + colors[2] + colors[1] + colors[0];
    return '#' +colormap[colorGroup];
  }

class TileDetailInfo extends AsynchDrilldown {
    constructor(name, plot, dataset, esEndpoint, esIndex) {
        super(name, dataset, esEndpoint, esIndex);
        this._dataset = dataset;
        this._currentNodeId = null;
        this.plot = plot;
        this.model = {

           exclusivenessFrom: 0,
            exclusivenessTo: 5,
            exclusiveness: 0,
        };

    

    }

    onElementInserted() {
        const exclusivenessSlider = new SliderGTRA({
            ticks: [0, 1, 2, 3, 4, 5],
            initialValue: this.model.exclusiveness,
            lowerLabel: 'low',
            upperLabel: 'high',
            slideStop: value => {
                this.model.exclusiveness = value;
            }
        });
        $('#slider-xcl').append(exclusivenessSlider.getElement());
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
            element.score = Math.round(timeGraph[i].score *20*10)/10 ;   
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

      //console.log(JSON.stringify(graphElement));


      // console.log(graphElement);


        //this.makeGraphDetail(data);
      

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

      /*  //7 
        c.dateFrom = "1372636800000";
        c.dateTo =   "1375142400000";*/

         //10.20~11.10
         c.dateFrom = 1382227200000;
         c.dateTo = 1384041600000;

        return c; 
    }


    show(data) {
        this.model.topic = data;
        //super.show(data, {}, false);
        super.showPopup(data);
    }



    get_coord(plotX, plotY, data){
 
        var tileX = Math.floor( plotX/ this.plot.tileSize);
        var tileY = Math.floor(plotY/this.plot.tileSize); 
        var tileZoom = Math.floor(this.plot.zoom);

        var dateFrom = $('[name=timeSlider]').val();

        var query = this.makeQuery(tileX, tileY, tileZoom,  dateFrom);

        //console.log(query);

    /*    d3.select(this).on("click", function(d){

          console.log('cliked');

           d3.select(this).append("svg")
                        .style('stroke', 'black')
                    .style('stroke-width', '1.8');
         });*/

        super.showTileDetail(data, query, true); 
     

    }

  

    makeGraphDetail(datas){

      //parse time 
       var timeGraph = datas.time_grath; 
       var allTopics = datas.all_topics; 


        var graphElement = [];

       for (var i =0; i<timeGraph.length; i++){

            var element ={};
            element.score = Math.round(timeGraph[i].score *20*10)/10 ; 
            var timearr= timeGraph[i].date.split('-');

            element.date = timearr[1]+'/'+timearr[0];
            element.alltopic =  allTopics[i].topics;

         
            element.index = i+1 ;
          
            graphElement[i] = element;

        }         
        var data =graphElement;

        /*var allTopics = datas.all_topics; 
        console.log(allTopics);
        var dayTopic = allTopics[3].topics;
        console.log(dayTopic);
        var exclusiveTopics = dayTopic[2].topic;
        console.log(exclusiveTopics);
        var words = exclusiveTopics[0].words; 
        console.log(words); 
        var sp_words= words[0];
        console.log(sp_words);

        console.log(allTopics[3].topics[2].topic[0]);*/


           
        var startwidth =300, startheight = 180;
        var svg = d3.select(".topic-drilldown-detail").append("svg").style("width", 300).style("height",180),
            margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = +startwidth - margin.left - margin.right,
            height = +startheight - margin.top - margin.bottom;



        var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
        var y = d3.scaleLinear().range([height, 0]);

        var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        data.forEach(function(d){

           d.score = d.score;
           d.index = d.index;
           d.date = d.date;

           //console.log(d.alltopic);
           d.alltopic = d.alltopic;


        });

       var textfield = d3.select(".topic-drilldown-detail").append("svg").attr("class","textfield")
                   .style("width", 300).style("height", 150);

       console.log(data);

        x.domain(data.map(function(d){ return d.date;}));
        y.domain([0, d3.max(data, function(d) { return d.score; })]);

       var axis= 
       g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(6).tickValues(["10/20","10/25","10/30","11/05","11/10"]));
        //.call(d3.axisBottom(x).ticks(7).tickValues(["07/01","07/05","07/10","07/15","07/20","07/25","07/30"]));
       // .call(d3.axisBottom(x).ticks(3));
        //.call(d3.axisBottom(x));

        g.append("g")
              .attr("class", "axis axis--y")
         /*     .style("stroke", "white")
              .style("stroke-width",0.1)*/
              .call(d3.axisLeft(y).ticks(10))
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", "0.71em")
              .attr("text-anchor", "end");

   /*    g.append("text")
         .attr("text-anchor", "middle")
         .attr("transform", "translate(" +(width/2)+","+(height+margin.top+20)+")")
         .text("score");*/

         g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 -(margin.left/3*2))
          .attr("x", 0 -(height/2))
          .style("text-anchor", "middle")
          .text("Novelty Score")
          .attr("fill","white");

       g.selectAll(".domain").attr("stroke","white");
       g.selectAll("line").attr("stroke","white");

          

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
             .style("fill", "#f8f9e9")
              .attr("class", "bar")
              .attr("x", function(d, i) { return x(d.date); })
              .attr("y", function(d,i) { return y(d.score);})
              .attr("width", x.bandwidth())
              .attr("height", function(d) { return height - y(d.score); })
              .on("click", function(d){

                   d3.selectAll(".bar").style("fill","#f8f9e9");


            /*      var shapeData = ["0", "1", "2", "3", "4", "5"], 
                      j = 0;  // Choose the star as default

                  // Create the shape selectors
                  var form = d3.select(".topic-description-topics").append("form");

                  var labelEnter = form.selectAll("span")
                      .data(shapeData)
                      .enter().append("span");

                  var checkedValue = 0;*/

                d3.selectAll(".topicText").remove();

               // console.log(d.alltopic);
               // console.log(d.alltopic[0].topic);

                var dayTopic = d.alltopic;


                var a= d.alltopic[0].topic[0].words[1].word;

                var topic_str= '';
                for(var i=0 ; i<5; i ++){   

                  var word_str = '';
                  var wordsArr = d.alltopic[5].topic[i]

                  //console.log(wordsArr);



                  for(var j=0; j<5; j++){
                    //console.log(d.alltopic[0].topic[i].words[j]);                  
                    //word_str+=wordsArr.words[j].word + ' ';
                    word_str+=d.alltopic[5].topic[i].words[j].word + ' ';

                    //console.log(word_str);

                  }
                  topic_str+=word_str + '\n';

                  var xPos = parseFloat(d3.select(this).attr("x"));
                  var yPos = parseFloat(d3.select(this).attr("y"));
                  var height = parseFloat(d3.select(this).attr("height"))

                  d3.select(this).style("fill","#00a7f6");

                  const groupcolor =_getWordColor(i);
                  var mycolor =d3.rgb(groupcolor);
                 // console.log(mycolor);


                  textfield.append("text")
                  .attr("class","topicText")
                  .attr("x",10)
                  .attr("y",15+20*i)
                  .style("font-size", 15)
                  .text(word_str)
                  .attr("fill",function(d,i){
                      return mycolor;
                  }); 

                  textfield.append("span")
                   .text(' ');

                 // d3.select(".topicText").style("color",mycolor);

                  //console.log(topic_str);
                };

           

      /*  labelEnter.append("input").attr("type","radio").attr("class","shape").attr("name","mode")
                  .attr("value", function(d, i) {return i;})
                   .property("checked", function(d, i) { 
                        return (i===j); 
                    }).on("click", function(d){

                      d3.selectAll(".topicText").remove();
                       checkedValue =d;
                       
                       var textValues = d3.selectAll(".textfield").data(data);

                       console.log(data);

                       for(var i=0 ; i<5; i ++){ 

                        var xPos = parseFloat(d3.select(this).attr("x"));
                        var yPos = parseFloat(d3.select(this).attr("y"));
                        var height = parseFloat(d3.select(this).attr("height"));

                        var word_str = '';
                        //var wordsArr = d.alltopic[0].topic[i]

                        textValues.append("text")
                                  .attr("class","topicText")
                                  .attr("x",xPos)
                                  .attr("y",yPos+i*10)
                                  .style("font", 5)
                                   .text(function(d){

                                    //console.log(dayTopic);

                                     for(var j=0; j<5; j++){     
                                         //console.log(dayTopic[checkedValue].topic[i].words[j]);                  
                                         word_str+=dayTopic[checkedValue].topic[i].words[j].word + ' ';
                                       };

                                    return word_str;       

                                   }); 
               
                        };



                    });*/

      /*  labelEnter.append("label").text(function(d) {return d;});


        console.log(checkedValue);
*/


               
              });

    
    }




}

module.exports = TileDetailInfo;
