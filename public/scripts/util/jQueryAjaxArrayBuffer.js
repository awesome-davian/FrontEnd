'use strict';

const _ = require('lodash');
const $ = require('jquery');

$.ajaxTransport('+arraybuffer', options => {
	let xhr;
	return {
		send: (headers, callback) => {
			// setup all letiables
			let url = options.url;
			let type = options.type;
			let async = options.async || true;
			let dataType = 'arraybuffer';
			let data = options.data || null;
			let username = options.username || null;
			let password = options.password || null;
			// create new XMLHttpRequest
			xhr = new XMLHttpRequest();
			xhr.addEventListener('load', () => {
				let d = {};
				d[options.dataType] = xhr.response;
				// make callback and send data
				callback(xhr.status, xhr.statusText, d, xhr.getAllResponseHeaders());
			});
			xhr.open(type, url, async, username, password);
			// setup custom headers
			_.forIn(headers, (header, key) => {
				xhr.setRequestHeader(key, header);
			});
			xhr.responseType = dataType;
			xhr.send(data);
		},
		abort: () => {
			xhr.abort();
		}
	};
});

module.exports = $;
