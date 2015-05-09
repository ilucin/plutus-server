'use strict';
process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var fs = require('fs');
var config = require('../config/config');

require('../app/utils/globals');
global.rootRequire = function(name) {
  return require(__dirname + '/../' + name);
};
global.rootRequireTree = function(name) {
  return require('require-tree')(__dirname + '/../' + name);
};

mongoose.connect(config.db);

var testPath = __dirname + '/tests';

if (process.argv.length > 3) {
  var file = process.argv[3].split('=')[1];
  require(testPath + '/' + file + (file.indexOf('.js') < 0 ? '.js' : ''));
} else {
  fs.readdirSync(testPath).forEach(function(currFile) {
    if (currFile.indexOf('.js') >= 0) {
      require(testPath + '/' + currFile);
    }
  });
}