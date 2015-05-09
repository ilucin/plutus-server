'use strict';
var validator = require('validator');

var BaseApiController = require('./base');
var UserModel = require('../../models/user');
var AccountModel = require('../../models/account');
var response = require('../../utils/response');
var mailer = require('../../services/mailer');
var safeSave = require('../../utils/safe-save');
var handler = response.handler;
var Msg = response.Messages;

function userById(res, userId, select) {
  UserModel.findById(userId).select(select || UserModel.prototype.selectString).populate('accounts').lean().exec(handler(res, function(user) {
    if (!user) {
      return response.error(res, 'User doesn\'t exist');
    }
    AccountModel.find({
      user: userId
    }).select(AccountModel.prototype.selectString).lean().exec(handler(res, function(accounts) {
      user.accounts = accounts;
      response.send(res, user);
    }));
  }));
}

function createUser(data, res, next) {
  var newUser = UserModel.new(data);
  newUser.generateAuthToken();
  newUser.save(handler(res, function() {
    safeSave(AccountModel.getDefaultAccounts(newUser._id), function(err) {
      if (err) {
        response.error(res, err);
      }
      next();
    });
  }, function(err) {
    response.error(res, UserModel.getError(err));
  }));
}

var UserController = BaseApiController.extend({
  beforeAction: {
    'prepareLoginForm': 'login',
    'authenticate': 'details, update, remove, accounts',
    'isOwner': 'details, update, remove',
    'login': 'login'
  },

  authenticated: function(req, res) {
    response.success(res, 'Authenticated');
  },

  details: function(req, res, userId) {
    userById(res, userId);
  },

  update: function(req, res, userId, data) {
    UserModel.findById(userId, handler(res, function(user) {
      if (!user || !!user.isDeleted) {
        return response.send404(res, Msg.NO_USER);
      }
      user.set(UserModel.filterUserData(data));
      user.save(handler(res, function() {
        userById(res, userId);
      }));
    }));
  },

  remove: function(req, res, userId) {
    UserModel.findById(userId).exec(handler(res, function(user) {
      if (!user || !!user.isDeleted) {
        return response.send404(res, Msg.NO_USER);
      } else {
        user.softDelete(function(err) {
          if (err) {
            response.error(err);
          } else {
            response.success();
          }
        });
      }
    }));
  },

  register: function(req, res, data) {
    var filteredData = UserModel.filterUserData(data);
    var user;

    UserModel.findOne({
      email: data.email,
      isPendingRegistration: true
    }).exec(handler(res, function(pendingUser) {
      if (!!pendingUser) {
        user = pendingUser;
        user.set(filteredData);
      } else {
        user = UserModel.new(filteredData);
      }

      user.generateAuthToken();
      user.setIsConfirmedEmail(false);
      user.setIsPendingRegistration(false);
      user.save(handler(res, function(user) {
        mailer.sendEmailConfirmation(user);
        userById(res, user._id, '-__v -password');
      }, function(err) {
        response.error(res, UserModel.getError(err));
      }));
    }));
  },

  login: function(req, res) {
    userById(res, req.user._id);
  },

  emailConfirmation: function(req, res, userId, body) {
    UserModel.findOne({
      _id: userId,
      isConfirmedEmail: false,
      emailConfirmationToken: body.emailConfirmationToken
    }, handler(res, function(user) {
      if (user) {
        user.setIsConfirmedEmail(true);
        user.save(handler(res, function() {
          response.success(res);
        }));
      } else {
        response.error(res, Msg.INVALID_ACTION);
      }
    }));
  },

  resendEmailConfirmation: function(req, res, body) {
    UserModel.findOne({
      email: body.email
    }, handler(res, function(user) {
      if (!user) {
        response.error(res, Msg.NO_USER);
      } else if (!!user.isConfirmedEmail) {
        response.error(res, Msg.EMAIL_ALREADY_CONFIRMED);
      } else {
        mailer.sendEmailConfirmation(user);
        response.success(res, Msg.EMAIL_CONFIRMATION_SENT);
      }
    }));
  },

  resetPassword: function(req, res, body) {
    var email = body.email;
    if (validator.isEmail(email)) {

      UserModel.findOne({
        email: email
      }, handler(res, function(user) {
        if (user) {
          user.generateResetPasswordToken();
          user.save(handler(res, function() {
            mailer.sendResetPasswordLink(user);
            response.success(res);
          }));
        } else {
          response.error(res, Msg.NO_USER);
        }
      }));
    } else {
      response.error(res, Msg.INVALID_INPUT);
    }
  },

  accounts: function(req, res) {
    AccountModel.findUpdatedAt(req.query.updatedAt)
      .lean()
      .select('-__v')
      .where('user').equals(req.user._id)
      .exec(handler(res, function(collabs) {
        response.send(res, collabs);
      }));
  },

  beforeFilters: _.defaults({
    prepareLoginForm: function(req, res, next) {
      req.body.username = req.body.email ? req.body.email.toLowerCase() : req.body.username;

      UserModel.findOne({
        email: req.body.email
      }, handler(res, function(existingUser) {
        if (!existingUser) {
          createUser(UserModel.filterUserData(req.body), res, next);
        } else {
          next();
        }
      }));
    }
  }, BaseApiController.prototype.beforeFilters)
});

module.exports = new UserController();
