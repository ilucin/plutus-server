'use strict';

var TokenStrategy = require('passport-token').Strategy;
var UserModel = require('../../models/user');
var Msg = require('../../utils/response').Messages;
var error = require('../../utils/auth-strategy-error')('tokenAuthStrategy');

var strategyOptions = {
  usernameHeader: 'x-auth-email',
  tokenHeader: 'x-auth-token',
  usernameField: 'auth-email',
  tokenField: 'auth-token'
};

var tokenAuthStrategy = new TokenStrategy(strategyOptions, function(username, token, done) {
  UserModel.findOne({
    email: username,
    authToken: token
  }).select('-__v').populate('collaborations').exec(function(err, user) {
    if (err) {
      error(done, err);
    } else if (!user) {
      error(done, null, Msg.AUTH_INVALID_USERNAME);
    } else {
      user.setLastTokenAction();
      user.save(function(err) {
        if (err) {
          error(done, null, Msg.USER_SAVE_ERR);
        } else {
          done(null, user);
        }
      });
    }
  });

});

module.exports = tokenAuthStrategy;
