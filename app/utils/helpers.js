'use strict';

var helpers = {
  getDeepValues: function(obj, argKeys) {
    var args = [];

    _.each(argKeys, function(argKey) {
      args.push(helpers.getDeepValue(obj, argKey));
    });

    return args;
  },

  getDeepValue: function(obj, argKey) {
    if (!obj || !argKey) {
      return;
    }

    var res = obj;
    var parts = argKey.split('.');
    _.each(parts, function(part) {
      if (res) {
        res = res[part];
      }
    });

    return res;
  },

  errHandler: function(clb) {
    return function(err) {
      if (err) {
        throw err;
      }
      if (clb) {
        clb.apply(this, arguments);
      }
    };
  },

  randomString: function() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '');
  }
};

module.exports = helpers;