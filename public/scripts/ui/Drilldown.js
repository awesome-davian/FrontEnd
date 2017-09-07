'use strict';

const $ = require('jquery');
const _ = require('lodash');
const template = require('../templates/Drilldown');
const Ajax = require('../util/ajax');


const TIMEOUT = 500;

class Drilldown {
	constructor(title, canClose = true) {
		this.title = _.isNil(title) ? '' : title;
		this.canClose = canClose;
		// create elements
		this._$container = $('<div class="drilldown-container"></div>');
		this._$container.append(template({
			title: title,
			body: '',
			canClose: canClose
		}));
		// set close handler
		this._$container.on('click', '#close-button', () => {
			this.hide();
		});
		// hide by default
		this.hide();
	}
	getElement() {
		return this._$container;
	}
	redraw(data) {
		// set the title if one exists
		this.getElement().empty();
		this.getElement().append(template(this.recomputeContext(data)));

		// display the drilldown
		this.getElement().css('display', '');
	}
	show(data) {
		this._isVisible = true;
		this.update(data);
	}
	showPopup(data){
		this._isVisible = true;
		this.getElement().empty();
		this.getElement().append(template(this.recomputeContext(data)));
		this.getElement().css('display', '');
	}
	showAsynch(startData, dataPromise) {

		// console.log(dataPromise);
		const display = (data, isLoading) => {
			if (!this._isVisible) {
				return;
			}
			/*if(typeof data ==='string'){
	    	   const c = this.recomputeContext(data);
	        }else {
	    	   const c =this.recomputeContextPromise(data);
	        }*/
			const c = this.recomputeContext(data);
			c.isLoading = isLoading;
			this.getElement().empty();
			this.getElement().append(template(c));
			this.getElement().css('display', '');
			this.onElementInserted();
			console.log('display');
			this.makeGraph(data);
		};
		// display drilldown with spinner after a timeout occurs
		const timeout = setTimeout(() => display(startData, true), TIMEOUT);
		dataPromise.then(d => {
			clearTimeout(timeout);
			console.log(d);
			display(d, false);
		})
		.catch( error => {
			console.error(error);
		});
		this._isVisible = true;
	}

	showAsynchTileDetail(startData, dataPromise) {

		console.log(dataPromise);


		const display = (data, isLoading) => {
			if (!this._isVisible) {
				return;
			}
			
			const c = this.recomputeContextTD(data);
			c.isLoading = isLoading;
			this.getElement().empty();
			this.getElement().append(template(c));
			this.getElement().css('display', '');
            this.makeGraphDetail(data);
			//this.onElementInserted();
			//console.log('showAsynchTileDetail');
			
		};
		// display drilldown with spinner after a timeout occurs
		const timeout = setTimeout(() => display(startData, true), TIMEOUT);
		dataPromise.then(d => {
			clearTimeout(timeout);
			//console.log(d);
			display(d, false);
		})
		.catch( error => {
			console.error(error);
		});
		this._isVisible = true;
	}

	showD3TileDetail(startData, dataPromise) {

	    console.log(dataPromise);

	    dataPromise.then(d =>{
		    
		    this.recomputeContextTD(d);

	    });

	    this.onElementInserted();

	    this._isVisible = true;
	}

	hide() {
		this.getElement().css('display', 'none');
		this._isVisible = false;
	}
	update(data) {
		if(!this._isVisible) {
			return;
		}
		this.redraw(data);
		this.onElementInserted();
	}
	recomputeContext(data) {

		// console.log(data);	
		const c = {};
		c.title = this.title;
		c.canClose = this.canClose;
		c.body = this.getBodyTemplate()(this.recomputeBodyContext(data));
		
		//console.log(c);
		return c;
	}

	recomputeContextTD(data) {

		console.log(data);	
		const c = {};
		c.title = this.title;
		c.canClose = this.canClose;
		c.body = this.getBodyTemplate()(this.recomputeBodyContextTD(data));
		
		//console.log(c);
		return c;
	}

	recomputeContextPromise(data) {
		//console.log(data);
        //console.log(data.documents);

        var documents = data.documents;

        for (var i =0; i < documents.length; i++){

				var doc = documents[i];
				var docCreated = doc.created_at;
				var docText = doc.text;
				var docUsername = doc.username;
			}

		const c = {};
		c.title = this.title;
		c.canClose = this.canClose;
		c.body = this.getBodyTemplate()(this.recomputeBodyContext(data));
		return c;
	}
	getBodyTemplate() {
		// should be overridden by sub-classes.
		return null;
	}
	onElementInserted() {
		// ff extra non-template DOM manipulation is required, implement that
		// work from here in your sub-class to be sure that the elements exist.
	}
	recomputeBodyContext(data) {
		// override if data manipulation / cleanup is required.

		return data;
	}

	recomputeBodyContextTD(data) {
		// override if data manipulation / cleanup is required.

		return data;
	}
}

module.exports = Drilldown;
