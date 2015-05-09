'use strict';

var Class = require('../utils/class');
var helpers = require('../utils/helpers');
var createError = require('../utils/error');
var response = require('../utils/response');

var BaseControllerError = createError('BaseControllerError');

var BaseController = Class.extend({
  viewPath: '',

  getActionMiddleware: function(action, args) {
    var me = this;
    var clbs = [];

    var beforeActionMiddleware = this.getBeforeFilters(action);
    if (beforeActionMiddleware) {
      clbs = clbs.concat(beforeActionMiddleware);
    }

    clbs.push(function(req, res) {
      me[action].apply(me, [req, res].concat(helpers.getDeepValues(req, args)));
    });

    return clbs;
  },

  async: function(promise, onSucess, onError) {
    if (onSucess) {
      promise.addCallback(onSucess.bind(this));
    }
    promise.addErrback(onError ? onError.bind(this) : function(err) {
      response.error(err);
    }.bind(this));
    return promise;
  },

  getBeforeFilters: function(action) {
    var res = [];
    var beforeFilters = this.beforeFilters;

    _.each(this.beforeAction, function(actionSelector, filterKeyList) {
      var filterKeys = filterKeyList.split(', ');
      var actions = actionSelector.split(', ');

      if (actionSelector === '*' || actions.indexOf(action) >= 0 && beforeFilters) {
        filterKeys.forEach(function(filterKey) {
          var filter = beforeFilters[filterKey];
          if (filter && res.indexOf(filter) < 0) {
            res.push(filter);
          }
        });
      }
    });

    return res;
  },

  beforeFilters: {
    log: function(req, res, next) {
      console.log(req.query, req.params, req.body);
      next();
    },

    isOwner: function(req, res, next) {
      var id = req.param('userId');
      if (req.user && req.user._id.toString() === id) {
        next();
      } else {
        response.unauthorized(res, new BaseControllerError('Current user doesn\'t have rights for this action.'));
      }
    }
  }
});

module.exports = BaseController;