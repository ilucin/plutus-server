'use strict';
process.env.NODE_ENV = 'development';

var mongoose = require('mongoose');
var config = require('../config/config');
global.rootDirname = __dirname + '/..';

require('../app/utils/globals');
global.rootRequire = function(name) {
  return require(__dirname + '/../' + name);
};
global.rootRequireTree = function(name) {
  return require('require-tree')(__dirname + '/../' + name);
};

mongoose.connect(config.db);

if (process.argv.length > 2) {
  var file = process.argv[2];
  require(__dirname + '/' + file + (file.indexOf('.js') < 0 ? '.js' : ''));
} else {
  console.log('No script to run.');
  process.exit();
}
