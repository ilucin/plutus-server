'use strict';

var express = require('express');

function splitRouteParams(routePath) {
  return routePath.split('/').filter(function(f) {
    return f.charAt(0) === ':';
  }).map(function(f) {
    return 'params.' + f.slice(1);
  });
}

function mapRouteAction(route, routeParams, httpMethod, action) {
  var actionParams = httpMethod.toLowerCase() !== 'get' ? routeParams.concat('body') : routeParams;
  if (_.isArray(action)) {

    var cntl = action[0];

    var clbs = cntl.getActionMiddleware(action[1], action[2] || actionParams);

    _.each(clbs, function(clb) {
      route = route[httpMethod](clb);
    });

  } else if (_.isFunction(action)) {
    route[httpMethod](action);
  }
}

function createRoute(router, routePath, routeDefinition) {
  var isOneHttpMethod = _.isArray(routeDefinition);
  var route, routeParams, httpMethod;

  if (isOneHttpMethod) {
    httpMethod = routePath.split(' ')[0];
    routePath = routePath.split(' ')[1];
  }

  route = router.route(routePath);
  routeParams = splitRouteParams(routePath);

  if (isOneHttpMethod) {
    mapRouteAction(route, routeParams, httpMethod, routeDefinition);
  } else {
    _.each(routeDefinition, function(action, httpMethod) {
      mapRouteAction(route, routeParams, httpMethod, action);
    });
  }
}

module.exports = function(routes) {
  var router = express.Router();

  _.each(routes, function(routeDefinition, routePath) {
    createRoute(router, routePath, routeDefinition);
  });

  return router;
};