'use strict';

const Ajax = require('../util/ajax');
const Drilldown = require('./Drilldown');
const $ = require('jquery');


class AsynchDrilldown extends Drilldown {
     constructor(name, dataset, esEndpoint, esIndex) {
        super(name, true);
        this._dataset = dataset;
        this._currentNodeId = null;
        //this.esURL = `${esEndpoint}/${esIndex}/_search?`;
        this.esURL = 'http://163.152.20.64:5001/GET_RELATED_DOCS/test'
    }

    // creates a promise responsible for asynchronously fetching data from the
    // server
    fetchDataAsynch(query) {

        var x = query.tileX;
        var y = query.tileY;
        var level = query.tileZoom; 
        var word = query.word;
        var date = query.date;

        // Request 메시지 생성 및 송/수신
        return Ajax.customAjaxPromise({
                url: this.esURL,
                method: 'POST',
                dataType: 'json',
                data: { 
                        "word": word, 
                         "x": x,
                         "y": y, 
                         "level" : level,
                        "date" : date 
                        }
        });

       
    }

     fetchDataAsynchTileDetail(query) {

        var x1 = query.tileX;
        var y1 = query.tileY;
        var level1 = query.tileZoom; 
        var dateFrom1 = parseInt(query.dateFrom);
        var dateTo1 = parseInt(query.dateTo);



        return Ajax.customAjaxPromise({
                url: 'http://163.152.20.64:5001/GET_TILE_DETAIL_INFO/test',
                method: 'POST',
                dataType: 'json',
                data: { 
                    
                         x: x1,
                         y: y1, 
                        level : level1 ,
                        from : dateFrom1,
                        to : dateTo1
                     
                    }
        });

       
    }



    show(data, query, showAsync = true) {
        if (showAsync) {
           this.showAsynch(data, this.fetchDataAsynch(query));
           //this.parseValuefromPromise(this.fetchDataAsynch(query));
        } else {
            super.show(data);
        }
    }

    showPopup(data){

        super.showPopup(data);
    }

     showTileDetail(data, query, showAsync = true) {
        if (showAsync) {
          this.showAsynchTileDetail(data, this.fetchDataAsynchTileDetail(query));
          //this.showD3TileDetail(data, this.fetchDataAsynchTileDetail(query));
        } else {
            super.show(data);
        }
    }


    hide() {
        this._node = null;
        super.hide();
    }

    parseValuefromPromise(dataPromise){

        console.log(dataPromise);
        console.log(dataPromise.documents);


    }

}

module.exports = AsynchDrilldown;
