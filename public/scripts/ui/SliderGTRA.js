'use strict';

const $ = require('jquery');
const BootstrapSlider = require('bootstrap-slider');
const template = require('../templates/SliderGTRA');

function defaultFormatter(value) {
	return value.toFixed(0);
}

class SliderGTRA {
	constructor(spec = {}) {
		// parse inputs
		this._formatter = spec.formatter || defaultFormatter;
		spec.initialFormattedValue = this._formatter(spec.initialValue);

		if (spec.ticks) {
			spec.isTicks = true;
			spec.tooltip = 'hide';
    		// create container element
    		this._$container = $(template(spec));
    		// create slider and attach callbacks
    		this._$slider = new BootstrapSlider(this._$container.find('.slider')[0], spec);
		} else {
    		spec.min = spec.min !== undefined ? spec.min : 0.0;
    		spec.max = spec.max !== undefined ? spec.max : 1.0;
    		spec.step = spec.step !== undefined ? spec.step : 0.1;
    		spec.initialValue = spec.initialValue !== undefined ? spec.initialValue : spec.max;

    		// create container element
    		this._$container = $(template(spec));
    		// create slider and attach callbacks
    		this._$slider = new BootstrapSlider(this._$container.find('.slider')[0], {
    			tooltip: 'hide',
    		});
		}

		this._$label = this._$container.find('.control-value-label');
		if ($.isFunction(spec.slideStart)) {
			this._$slider.on('slideStart', spec.slideStart);
		}
		if ($.isFunction(spec.slideStop)) {
			this._$slider.on('slideStop', spec.slideStop);
		}
		if ($.isFunction(spec.change)) {
			this._$slider.on('change', spec.change);
		}
		if ($.isFunction(spec.slide)) {
			this._$slider.on('slide', spec.slide);
		}
		this._$slider.on('change', event => {
			this._$label.text(this._formatter(event.newValue));
		});
	}
	getElement() {
		return this._$container;
	}
}

module.exports = SliderGTRA;
