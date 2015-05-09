'use strict';

var _ = require('lodash-node');
var path = require('path');
var rootPath = path.normalize(__dirname + '/..');
var env = process.env.NODE_ENV || 'development';

console.log('Environment:', env);

var config = {
  development: {
    port: 3000,
    db: 'mongodb://localhost/plutus-development',
    expressLogger: true,
    logMails: true,
    openMail: true,
    sendMails: true
  },

  test: {
    port: 3333,
    db: 'mongodb://localhost/plutus-test',
    expressLogger: true,
    logMails: false,
    sendMails: false
  },

  production: {
    port: '3000',
    db: 'mongodb://localhost/plutus',
    logMails: false,
    sendMails: true,
    expressLogger: false
  }
};

var exportedConfig = _.defaults(config[env], {
  root: rootPath,
  links: {
    websiteUrl: 'http://www.plutus.io'
  }
});

module.exports = exportedConfig;
