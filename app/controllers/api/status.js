'use strict';

var BaseApiController = require('./base');
var response = require('../../utils/response');

var StatusController = BaseApiController.extend({
  status: function(req, res) {
    response.send(res, 'OK');
  }
});

module.exports = new StatusController();
