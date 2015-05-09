'use strict';

var qs = require('querystring');

/* Taken over https://github.com/OliverJAsh/control/blob/master/lib/utils/pagination.js */

module.exports.helpers = {
  getPage: function(page, urlObj) {
    var querystring = _.extend({}, urlObj);
    querystring.page = page;
    return this.stringify(querystring);
  },
  stringify: function(querystring) {
    return '?' + qs.stringify(querystring);
  }
};