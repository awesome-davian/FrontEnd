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
            exclusiveness: 3,   // 0.7

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
            // timeFromLimit: 1383436800000,
            // timeToLimit: 1383609600000,
            // timeFrom: 1383436800000,
            // timeTo: 1383609600000,

            // 130920-131231
            timeFromLimit: 1380585600000,
            timeToLimit: 1388448000000,
            timeFrom: 1380585600000,
            timeTo: 1388448000000,            
            
            
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
            ticks: [0, 1],
            initialValue: this.model.exclusiveness,
            lowerLabel: 'low',
            upperLabel: 'high',
            slideStop: value => {
                this.model.exclusiveness = value;
            }
        });
        $('#slider-exclusiveness').append(exclusivenessSlider.getElement());

		// this._$toggleIcon = $('.heatmap-toggle i');
		// this._$toggle = $('.heatmap-toggle');
		// this._$toggle.click(() => {
		// 	this.heatmapToggleEnabled();
		// });

        this._$selectionIconMapColorModeLight = $('.map-mode-select-light i');
        this._$selectionMapColorModeLight = $('.map-mode-select-light');
        this._$selectionMapColorModeLight.click(() => {
            this.selectionMapColorModeClicked(1);
        });

        this._$selectionIconMapColorModeDark = $('.map-mode-select-dark i');
        this._$selectionMapColorModeDark = $('.map-mode-select-dark');
        this._$selectionMapColorModeDark.click(() => {
            this.selectionMapColorModeClicked(2);
        });

        this._$selectionIconMapColorModeLight.removeClass('fa-square-o');
        this._$selectionIconMapColorModeDark.removeClass('fa-check-square-o');
        this._$selectionIconMapColorModeLight.addClass('fa-square-o');
        this._$selectionIconMapColorModeDark.addClass('fa-check-square-o');

        this._$selectionIconStan = $('.algo-select-stan i');
        this._$selectionStan = $('.algo-select-stan');
        this._$selectionStan.click(() => {
            this.selectionClicked(1);
        });

        // this._$selectionIconStexLow = $('.algo-select-stex-low i');
        // this._$selectionStexLow = $('.algo-select-stex-low');
        // this._$selectionStexLow.click(() => {
        //     this.selectionClicked(2);
        // });

        // this._$selectionIconStexHigh = $('.algo-select-stex-high i');
        // this._$selectionStexHigh = $('.algo-select-stex-high');
        // this._$selectionStexHigh.click(() => {
        //     this.selectionClicked(3);
        // });

        this._$selectionIconStex6 = $('.algo-select-stex-6 i');
        this._$selectionStex6 = $('.algo-select-stex-6');
        this._$selectionStex6.click(() => {
            this.selectionClicked(2);
        });

        this._$selectionIconStex7 = $('.algo-select-stex-7 i');
        this._$selectionStex7 = $('.algo-select-stex-7');
        this._$selectionStex7.click(() => {
            this.selectionClicked(3);
        });

        this._$selectionIconStex8 = $('.algo-select-stex-8 i');
        this._$selectionStex8 = $('.algo-select-stex-8');
        this._$selectionStex8.click(() => {
            this.selectionClicked(4);
        });

        this._$selectionIconStex9 = $('.algo-select-stex-9 i');
        this._$selectionStex9 = $('.algo-select-stex-9');
        this._$selectionStex9.click(() => {
            this.selectionClicked(5);
        });

        this.selectionClicked(2);
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

        console.log('[UB] onShowTopics(), Method: ' + this.model.exclusiveness);

        // const include = $('[name=terms-include]').val();
        // const exclude = $('[name=terms-exclude]').val();
        const clusterCount = this.getIntParameter('count-cluster') || this.model.clusterCount;
        const wordCount = this.getIntParameter('count-word') || this.model.wordCount;

        // Refresh all tiles in view. Unmuting requests all tiles in view!
        const topicLayer = this.plot.layers.find(l => {
            return l.constructor === veldt.Layer.Topic;
        });

		// topicLayer.setInclude(include.split(',') || this.model.include.split(','));
		// topicLayer.setExclude(exclude.split(',') || this.model.exclude.split(','));
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
        // const exLayer = this.plot.layers.find(l => {
        //     return l.constructor === veldt.Layer.Exclusiveness;
        // });
        // exLayer.setTimeFrom(this.model.timeFrom);
        // exLayer.setTimeTo(this.model.timeTo);

        // if (exLayer.hasUpdatedParameters()) {
        //     exLayer.unmute();
        //     // All previously loaded tiles are no longer relevant.
        //     exLayer.refresh();
        //     exLayer.resetParameters();
        // }
        
    }

    onShowGeoPoint(model, word) {

        // console.log(event);

        const geopointLayer = this.plot.layers.find(l => {
            return l.constructor === veldt.Layer.GeoPoint;
        });
        geopointLayer.setTimeFrom(this.model.timeFrom);
        geopointLayer.setTimeTo(this.model.timeTo);
        geopointLayer.setQueryWord(word);

        if (geopointLayer.hasUpdatedParameters()) {
            // console.log("onShowGeoPoint(), hasUpdatedParameters == true")
            geopointLayer.unmute();
            geopointLayer.show();
            // All previously loaded tiles are no longer relevant.
            geopointLayer.refresh();
            // geopointLayer.resetParameters();
        }

        // geopointLayer.enable();
    }

    onHideGeoPoint() {
        // console.log("onHideGeoPoint()")

        const geopointLayer = this.plot.layers.find(l => {
            return l.constructor === veldt.Layer.GeoPoint;
        });

        if (!geopointLayer.isDisabled())
            // console.log("onHideGeoPoint(), layer is already in disable");
            // this.disable(geopointLayer);
            geopointLayer.disable();
            geopointLayer.refresh();

        return this;
    }

    onShowWordGlyph(model, word) {
        // console.log("onShowWordGlyph()");
        const glyphLayer = this.plot.layers.find(l => {
            return l.constructor === veldt.Layer.WordGlyph;
        });
        glyphLayer.setTimeFrom(this.model.timeFrom);
        glyphLayer.setTimeTo(this.model.timeTo);
        glyphLayer.setQueryWord(word);

        if (glyphLayer.hasUpdatedParameters()) {
            // console.log("onShowWordGlyph(), hasUpdatedParameters == true")

            glyphLayer.unmute();
            glyphLayer.show();

            
            // All previously loaded tiles are no longer relevant.
            glyphLayer.refresh();
            // glyphLayer.resetParameters();

            // console.log(glyphLayer);
        }   

        // glyphLayer.enable();
    }

    onHideWordGlyph() {

        // console.log("onHideWordGlyph()");

        const glyphLayer = this.plot.layers.find(l => {
            return l.constructor === veldt.Layer.WordGlyph;
        });

        // console.log(glyphLayer);

        if (!glyphLayer.isDisabled()) {
            // console.log("onHideWordGlyph(), layer disabled");
            // this.disable(glyphLayer);
            glyphLayer.disable();
            glyphLayer.refresh();
        }

        return this;
    }

    selectionClicked(algo) {

        // if (algo == 1) {

        //     this._$selectionIconStexLow.removeClass('fa-check-square-o');
        //     this._$selectionIconStexHigh.removeClass('fa-check-square-o');
        //     this._$selectionIconStan.removeClass('fa-square-o');

        //     this._$selectionIconStan.addClass('fa-check-square-o');
        //     this._$selectionIconStexLow.addClass('fa-square-o');
        //     this._$selectionIconStexHigh.addClass('fa-square-o');

        // } else if (algo == 2) {

        //     this._$selectionIconStan.removeClass('fa-check-square-o');
        //     this._$selectionIconStexLow.removeClass('fa-square-o');
        //     this._$selectionIconStexHigh.removeClass('fa-check-square-o');

        //     this._$selectionIconStan.addClass('fa-square-o');
        //     this._$selectionIconStexLow.addClass('fa-check-square-o');
        //     this._$selectionIconStexHigh.addClass('fa-square-o');

        // } else if (algo == 3) {
        
        //     this._$selectionIconStan.removeClass('fa-check-square-o');
        //     this._$selectionIconStexLow.removeClass('fa-check-square-o');
        //     this._$selectionIconStexHigh.removeClass('fa-square-o');

        //     this._$selectionIconStan.addClass('fa-square-o');
        //     this._$selectionIconStexLow.addClass('fa-square-o');
        //     this._$selectionIconStexHigh.addClass('fa-check-square-o');

        this._$selectionIconStex6.removeClass('fa-square-o');
        this._$selectionIconStex7.removeClass('fa-square-o');
        this._$selectionIconStex8.removeClass('fa-square-o');
        this._$selectionIconStex9.removeClass('fa-square-o');
        this._$selectionIconStan.removeClass('fa-square-o');

        this._$selectionIconStex6.removeClass('fa-check-square-o');
        this._$selectionIconStex7.removeClass('fa-check-square-o');
        this._$selectionIconStex8.removeClass('fa-check-square-o');
        this._$selectionIconStex9.removeClass('fa-check-square-o');
        this._$selectionIconStan.removeClass('fa-check-square-o');

        if (algo == 1) {

            this._$selectionIconStan.addClass('fa-check-square-o');
            this._$selectionIconStex6.addClass('fa-square-o');
            this._$selectionIconStex7.addClass('fa-square-o');
            this._$selectionIconStex8.addClass('fa-square-o');
            this._$selectionIconStex9.addClass('fa-square-o');

        } else if (algo == 2) {

            this._$selectionIconStan.addClass('fa-square-o');
            this._$selectionIconStex6.addClass('fa-check-square-o');
            this._$selectionIconStex7.addClass('fa-square-o');
            this._$selectionIconStex8.addClass('fa-square-o');
            this._$selectionIconStex9.addClass('fa-square-o');

        } else if (algo == 3) {
        
            this._$selectionIconStan.addClass('fa-square-o');
            this._$selectionIconStex6.addClass('fa-square-o');
            this._$selectionIconStex7.addClass('fa-check-square-o');
            this._$selectionIconStex8.addClass('fa-square-o');
            this._$selectionIconStex9.addClass('fa-square-o');

        } else if (algo == 4) {

            this._$selectionIconStan.addClass('fa-square-o');
            this._$selectionIconStex6.addClass('fa-square-o');
            this._$selectionIconStex7.addClass('fa-square-o');
            this._$selectionIconStex8.addClass('fa-check-square-o');
            this._$selectionIconStex9.addClass('fa-square-o');

        } else if (algo == 5) {
        
            this._$selectionIconStan.addClass('fa-square-o');
            this._$selectionIconStex6.addClass('fa-square-o');
            this._$selectionIconStex7.addClass('fa-square-o');
            this._$selectionIconStex8.addClass('fa-square-o');
            this._$selectionIconStex9.addClass('fa-check-square-o');
        
        } else {
            
            this._$selectionIconStan.addClass('fa-square-o');
            this._$selectionIconStex6.addClass('fa-square-o');
            this._$selectionIconStex7.addClass('fa-square-o');
            this._$selectionIconStex8.addClass('fa-square-o');
            this._$selectionIconStex9.addClass('fa-square-o');          
        }
        
        this.model.exclusiveness = algo;

        // console.log('[I][' + (new Date()).toLocaleTimeString() + '] NMF algorithm -> ' + algo);
    }

    selectionMapColorModeClicked(mode) {

        const lightMap = this.plot.layers.find(l => {
            return l.constructor === veldt.Layer.Map_Light;
        });

        const darkMap = this.plot.layers.find(l => {
            return l.constructor === veldt.Layer.Map_Dark;
        });

        if (mode == 1) {
            this._$selectionIconMapColorModeLight.removeClass('fa-square-o');
            this._$selectionIconMapColorModeDark.removeClass('fa-check-square-o');

            this._$selectionIconMapColorModeLight.addClass('fa-check-square-o');
            this._$selectionIconMapColorModeDark.addClass('fa-square-o');

            
            lightMap.show();
            darkMap.hide();

        } else  {

            this._$selectionIconMapColorModeLight.removeClass('fa-check-square-o');
            this._$selectionIconMapColorModeDark.removeClass('fa-square-o');

            this._$selectionIconMapColorModeLight.addClass('fa-square-o');
            this._$selectionIconMapColorModeDark.addClass('fa-check-square-o');

            lightMap.hide();
            darkMap.show();
        }   

        console.log('[UB] A map color changed ' + (mode === 1 ? 'Light' : 'Dark'));
    }

	// heatmapToggleEnabled() {
 //        const exLayer = this.plot.layers.find(l => {
 //            return l.constructor === veldt.Layer.Exclusiveness;
 //        });

	// 	if (exLayer.isDisabled()) {
	// 		this.enable(exLayer);
	// 	} else {
	// 		this.disable(exLayer);
	// 	}

	// 	return this;
	// }

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
