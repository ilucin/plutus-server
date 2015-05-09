'use strict';

var LocalStrategy = require('passport-local').Strategy;
var UserModel = require('../../models/user');
var Msg = require('../../utils/response').Messages;
var error = require('../../utils/auth-strategy-error')('tokenAuthStrategy');

var localAuthStrategy = new LocalStrategy(function(username, password, done) {

  UserModel.findOne({
    email: username
  }).select('-__v').populate('collaborations').exec(function(err, user) {
    if (err) {
      error(done, err);
    } else if (!user) {
      error(done, null, Msg.AUTH_INVALID_USERNAME);
    } else if (!!user.isDeleted) {
      error(done, null, Msg.AUTH_NO_USER);
    } else if (!user.validatePassword(password)) {
      error(done, null, Msg.AUTH_INVALID_PASSWORD);
    } else {
      user.generateAuthToken();
      user.save(function(err, userWithToken) {
        if (err) {
          error(done, null, Msg.USER_SAVE_ERR);
        } else {
          done(null, userWithToken);
        }
      });
    }
  });
});

module.exports = localAuthStrategy;
