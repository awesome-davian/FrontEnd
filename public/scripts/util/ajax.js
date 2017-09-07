'use strict';

const _ = require('lodash');
const $ = require('jquery');

/**
 * Utils for doing ajax requests with standard es6/native Promises
 * (jQuery's functions are promise-like but non-standard.)
 */

/**
 * Similar to jQuery.ajax(), but don't supply success/error callbacks. Converts
 * error text/objects to one string message to send back.
 *
 * @param ajaxOpts
 * @returns {Promise}
 */
function ajaxPromise(ajaxOptions){
    return new Promise((resolve, reject) => {
        const opts = _.assign({
            success: result => {
                resolve(result);
            },
            error: (req) => {
                let msg = req.statusText;
                try {
                    const responseJSON = JSON.parse(req.responseText);
                    msg = _.get(responseJSON, 'message', msg);
                } catch (parseError) { console.log(parseError); }

                reject(msg);
            }
        }, ajaxOptions);

        $.ajax(opts);
    });
}

/**
 * Similar to jQuery.getJSON, but don't supply success/error callbacks, post,
 * and dataType and you don't have to bother JSON.stringify-ing the 'data'
 * parameter as you would with jQuery which normally converts to query string).
 *
 * @param ajaxOpts
 * @returns {Promise}
 */
function jsonPostPromise(ajaxOptions){
    let stringData = ajaxOptions.data;

    if(!_.isNil(ajaxOptions.data) && !_.isString(ajaxOptions.data)){
        stringData = JSON.stringify(ajaxOptions.data);
    }

     console.log(stringData);

    const opts = _.assign({}, ajaxOptions, {
        method: 'POST',
        dataType: 'json',
        data: stringData
    });

    return ajaxPromise(opts);
}

function customAjaxPromise(ajaxOptions){
    return new Promise(function (resolve, reject) {
        // console.log(ajaxOptions.data);
    $.ajax(ajaxOptions).done(resolve).fail(reject);
  });
}

module.exports = {
    jsonPostPromise: jsonPostPromise,
    ajaxPromise: ajaxPromise,
    customAjaxPromise: customAjaxPromise
};


