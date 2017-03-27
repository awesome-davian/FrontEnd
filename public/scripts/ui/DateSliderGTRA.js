'use strict';

const $ = require('jquery');
const moment = require('moment');
const Slider = require('bootstrap-slider');
const template = require('../templates/DateSliderGTRA');
const DAY_MS = 86400000;

function getFriendlyDate(date) {
	return moment.utc(date).format('MMM Do YYYY');
}

function defaultFormatter(values) {
	return `${getFriendlyDate(values[0])} to ${getFriendlyDate(values[1])}`;
}

class DateSliderGTRA {
	constructor(spec = {}) {
		// parse inputs
		spec.label = spec.label || 'missing-label';
		spec.min = spec.min !== undefined ? spec.min : 0;
		spec.max = spec.max !== undefined ? spec.max : Date.now();
		spec.step = DAY_MS;
		this._formatter = spec.formatter || defaultFormatter;
		if (spec.initialValue !== undefined) {
			spec.initialFormattedValue = this._formatter(spec.initialValue);
			spec.initialValue = '[' + spec.initialValue[0] + ',' + spec.initialValue[1] + ']';
		} else {
			spec.initialFormattedValue = this._formatter([spec.min, spec.max]);
			spec.initialValue = '[' + spec.min + ',' + spec.max + ']';
		}
		// create container element
		this._$container = $(template(spec));
		this._$label = this._$container.find('.date-label-gtra');
		// create slider and attach callbacks
		this._$slider = new Slider(this._$container.find('.slider-gtra')[0], {
			tooltip: 'hide',
		});
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

module.exports = DateSliderGTRA;
