'use strict';

require('./app/utils/globals');
global.rootRequire = function(name) {
  return require(__dirname + '/' + name);
};
global.rootRequireTree = function(name) {
  return require('require-tree')(__dirname + '/' + name);
};
global.rootDirname = __dirname;

var express = require('express');
var fs = require('fs');
var config = require('./config/config');
var mongoose = require('mongoose');

require('./config/auth');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function() {
  throw new Error('Unable to connect to database at ' + config.db);
});

var modelsPath = __dirname + '/app/models';
fs.readdirSync(modelsPath).forEach(function(file) {
  if (file.indexOf('.js') >= 0) {
    require(modelsPath + '/' + file);
  }
});

var routerMiddlewares = [];
var routerPath = __dirname + '/app/routers';
fs.readdirSync(routerPath).forEach(function(file) {
  if (file.indexOf('.js') >= 0 && file !== 'setup.js') {
    routerMiddlewares.push(require(routerPath + '/' + file));
  }
});

var app = express();
require('./config/express')(app, routerMiddlewares, config);
app.listen(config.port);

module.exports = app;
