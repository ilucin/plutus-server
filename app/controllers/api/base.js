'use strict';

var passport = require('passport');

var BaseController = require('../base');
var response = require('../../utils/response');

var BaseApiController = BaseController.extend({
  beforeFilters: _.defaults({
    authenticate: function(req, res, next) {
      passport.authenticate('token', {
        session: false
      }, function(err, user, authErr) {
        if (err) {
          return next(err);
        }
        if (!user) {
          response.unauthorized(res, authErr.message);
        } else {
          req.user = user;
          next();
        }
      })(req, res, next);
    },

    login: function(req, res, next) {
      passport.authenticate('local', {
        session: false
      }, function(err, user, authErr) {
        if (err) {
          return next(err);
        }
        if (!user) {
          response.unauthorized(res, authErr.message);
        } else {
          req.user = user;
          next();
        }
      })(req, res, next);
    },

    delay: function(req, res, next) {
      setTimeout(next, 3000);
    }
  }, BaseController.prototype.beforeFilters)
});

module.exports = BaseApiController;
