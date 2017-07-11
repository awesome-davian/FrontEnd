'use strict';

const SliderGTRA = require('./SliderGTRA');
const moment = require('moment');
const veldt = require('veldt');
const template = require('../templates/TopicDriver');
const $ = require('jquery');
const Drilldown = require('./Drilldown');
const DAY_MS = 86400000;

class TopicDriver extends Drilldown {
    constructor(name, plot, dataset) {
        super(name, false);
        this._dataset = dataset;
        this._currentNodeId = null;
        this.plot = plot;

        this.model = {
            exclusivenessFrom: 0,
            exclusivenessTo: 5,
            exclusiveness: 0,

       /*     //131101-131130
            timeFromLimit: 1383264000000, 
            timeToLimit: 1385769600000,
            timeFrom: 1383264000000,
            timeTo: 1385769600000,*/

      /*      //130701-130731
            timeFromLimit: 1372636800000, 
            timeToLimit: 1375142400000, // March 1st 2015
            timeFrom: 1372636800000,
            timeTo: 1375142400000,*/


           //131020-131110
            // timeFromLimit: 1382227200000,
            // timeToLimit: 1384041600000,
            // timeFrom: 1382227200000,
            // timeTo: 1384041600000,
            
            // 131103-131105
            timeFromLimit: 1383436800000,
            timeToLimit: 1383609600000,
            timeFrom: 1383436800000,
            timeTo: 1383609600000,
            
            
            clusterCount: 4,
            wordCount: 4,
            include: '',
            exclude: ''
        };

        this.getElement().on('click', '#topic-tiler', () => {
            this.onShowTopics();
        });
    }

    onElementInserted() {
        const timeSlider = this._createSlider(value => {
            this.model.timeFrom = value;
            this.model.timeTo = value;
        });
        $('#slider-time').append(timeSlider.getElement());

        const exclusivenessSlider = new SliderGTRA({
            ticks: [0, 1, 2, 3, 4, 5],
            initialValue: this.model.exclusiveness,
            lowerLabel: 'low',
            upperLabel: 'high',
            slideStop: value => {
                this.model.exclusiveness = value;
            }
        });
        $('#slider-exclusiveness').append(exclusivenessSlider.getElement());

		this._$toggleIcon = $('.layer-toggle i');
		this._$toggle = $('.layer-toggle');
		this._$toggle.click(() => {
			this.toggleEnabled();
		});
    }

    _createSlider(onSlideStop) {
        return new SliderGTRA({
            min: this.model.timeFromLimit,
            max: this.model.timeToLimit,
            step: DAY_MS,
            initialValue: this.model.timeFrom,
            slideStop: value => {
                onSlideStop(value);
            },
            formatter: value => {
                return `${moment.utc(value).format('MMM Do YYYY')}`;
            }
        });
    }

    getBodyTemplate() {
        return template;
    }

	recomputeBodyContext(data) {
		return this.model;
	}

    getIntParameter(parameterName) {
        const value = $('[name=' + parameterName + ']').val();

        return parseInt(value);
    }

    // Actions
    onShowTopics() {
        const include = $('[name=terms-include]').val();
        const exclude = $('[name=terms-exclude]').val();
        const clusterCount = this.getIntParameter('count-cluster') || this.model.clusterCount;
        const wordCount = this.getIntParameter('count-word') || this.model.wordCount;

        // Refresh all tiles in view. Unmuting requests all tiles in view!
        const topicLayer = this.plot.layers.find(l => {
            return l.constructor === veldt.Layer.Topic;
        });

		topicLayer.setInclude(include.split(',') || this.model.include.split(','));
		topicLayer.setExclude(exclude.split(',') || this.model.exclude.split(','));
        topicLayer.setExclusiveness(this.model.exclusiveness);
        topicLayer.setTopicWordCount(wordCount);
        topicLayer.setTopicClusterCount(clusterCount);
        topicLayer.setTimeFrom(this.model.timeFrom);
        topicLayer.setTimeTo(this.model.timeTo);

      //  topicLayer.unmute();
        if (topicLayer.hasUpdatedParameters()) {
            topicLayer.unmute();
            // All previously loaded tiles are no longer relevant.
            topicLayer.refresh();
            topicLayer.resetParameters();
        }
        //topicLayer.mute();

        // Update the exclusiveness heatmap tile.
        const exLayer = this.plot.layers.find(l => {
            return l.constructor === veldt.Layer.Exclusiveness;
        });
        exLayer.setTimeFrom(this.model.timeFrom);
        exLayer.setTimeTo(this.model.timeTo);

       // exLayer.unmute();
        if (exLayer.hasUpdatedParameters()) {
            exLayer.unmute();
            // All previously loaded tiles are no longer relevant.
            exLayer.refresh();
            exLayer.resetParameters();
        }
        //exLayer.mute();
    }

	toggleEnabled() {
        const exLayer = this.plot.layers.find(l => {
            return l.constructor === veldt.Layer.Exclusiveness;
        });

		if (exLayer.isDisabled()) {
			this.enable(exLayer);
		} else {
			this.disable(exLayer);
		}
		return this;
	}

	disable(layer) {
		layer.disable();
		this._$toggleIcon.removeClass('fa-check-square-o');
		this._$toggleIcon.addClass('fa-square-o');
		return this;
	}

	enable(layer) {
		layer.enable();
		this._$toggleIcon.removeClass('fa-square-o');
		this._$toggleIcon.addClass('fa-check-square-o');
		return this;
	}

}

module.exports = TopicDriver;
