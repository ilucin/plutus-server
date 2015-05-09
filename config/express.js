'use strict';

var express = require('express');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var passport = require('passport');

var viewHelpers = rootRequireTree('app/utils/view-helpers');

module.exports = function(app, routerMiddlewares, config) {
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'jade');

  // app.use(favicon(config.root + '/public/img/favicon.ico'));
  if (!!config.expressLogger) {
    app.use(logger('dev'));
  }
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use(methodOverride());
  app.use(passport.initialize());

  _.extend(app.locals, viewHelpers);

  routerMiddlewares.map(function(rm) {
    app.use(rm.route, rm.router);
  });

  /// catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // development error - handler will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res) { //, next
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  }

  // production error handler - no stacktraces leaked to user
  app.use(function(err, req, res) { //, next
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
      title: 'error'
    });
  });
};
