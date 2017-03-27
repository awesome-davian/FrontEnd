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
                console.log('string');
            }
        else{
               var documents = data.documents; 

               //var userName = documents.userName;
            
               var usernames = [];
               var createdAt = [];
               var texts = [];

               var tweet = [];



              for (var i =0; i<documents.length; i++){

                    
                    var readable_time = getFriendlyDate(documents[i].created_at);
                    console.log('created_at: ' + documents[i].created_at);
                    console.log('readable_time: ' + readable_time);

                    usernames[i] =  documents[i].username;
                    createdAt[i] =  readable_time;
                    texts[i] =documents[i].text;

                    var tweetData ={};
                    tweetData.username = documents[i].username;
                    // tweetData.createdAt = documents[i].created_at;
                    tweetData.created_at = readable_time;
                    tweetData.texts= documents[i].text;

                    tweet[i] =tweetData
               };

             //console.log(usernames);
               //this.model.tweets.text = documents.text;
               //this.model.tweets.username = usernames; 

               /*const tweet = {}; 
               tweet.username = usernames;
               tweet.created_at =createdAt;
               tweet.text = texts;
               console.log(tweet);*/
               //console.log(tweet);

               this.model.tweets = tweet;

            }



        console.log(data);
        const c = {};
        // local model
        Object.assign(c, this.model);

        console.log(c);

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

        console.log(this.model);

       $('.word-cloud-label').on('click', function(){

         console.log('test')
       });
    
       $('.word-cloud-label').on('click', event=>{

        /* console.log(event.plotPx.x);
         console.log(plot.viewport.x);*/

       } );


        super.show(data, {}, false);
    }

    get_coord(plotX, plotY, data){
 
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


    
}

module.exports = TopicDrilldown;
