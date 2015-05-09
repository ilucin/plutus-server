'use strict';
var moment = require('moment');

var createModel = require('../utils/model');
var hasher = require('../utils/hasher');
var helpers = require('../utils/helpers');
var userSchema = require('../schema/user');

var UserModel = createModel('User', 'users', userSchema, {
  selectString: '-__v -resetPasswordToken -resetPasswordSentAt -lastTokenActionAt',

  initialize: function() {
    this.updateProperties();
  },

  getClearTextPassword: function() {
    return this._clearTextPassword;
  },

  updateProperties: function() {
    this.setPassword(this.password);
    this.generateEmailConfirmationToken();
    this.categories = UserModel.getDefaultCategories();
    if (!this.name) {
      this.name = this.email.split('@')[0];
    }
  },

  setPassword: function(password) {
    this._clearTextPassword = password;
    this.password = UserModel.hashPassword(password);
  },

  validatePassword: function(password) {
    return this.password === UserModel.hashPassword(password);
  },

  generateAuthToken: function() {
    this.authToken = helpers.randomString();
  },

  generatePassword: function() {
    this.setPassword(helpers.randomString());
  },

  generateResetPasswordToken: function() {
    this.resetPasswordToken = helpers.randomString();
    this.resetPasswordSentAt = Date.now();
  },

  generateEmailConfirmationToken: function() {
    this.emailConfirmationToken = helpers.randomString();
  },

  resetPassword: function(pass) {
    this.setPassword(pass);
    this.resetPasswordToken = null;
    this.resetPasswordSentAt = null;
  },

  setIsConfirmedEmail: function(isConfirmedEmail) {
    this.isConfirmedEmail = !!isConfirmedEmail;
  },

  setLastTokenAction: function() {
    this.lastTokenActionAt = Date.now();
  }
});

UserModel.getDefaultCategories = function() {
  return [{
    _id: 1,
    name: 'Expense',
    type: 'expense'
  }, {
    _id: 2,
    name: 'Salary',
    type: 'income'
  }];
};

UserModel.filterUserData = function(data) {
  return _.pick(data, ['email', 'password', 'firstName', 'lastName', 'avatar']);
};

UserModel.hashPassword = function(password) {
  var salt = 'plutussalt';
  return hasher.sha1(password + salt);
};

UserModel.findByResetPasswordToken = function(email, token, clb) {
  var q = UserModel.findOne({
    email: email,
    resetPasswordToken: token
  }).where('resetPasswordSentAt').gte(moment().subtract(2, 'hours'));
  return clb ? q.exec(clb) : q;
};

module.exports = UserModel;
