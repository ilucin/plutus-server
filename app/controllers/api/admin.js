'use strict';

var BaseApiController = require('./base');
var TransactionModel = require('../../models/transaction');
var AccountModel = require('../../models/account');
var UserModel = require('../../models/user');
var response = require('../../utils/response');
var handler = response.handler;

var AdminController = BaseApiController.extend({
  beforeAction: {
    'authenticateAdmin': '*'
  },

  setDeletedFalse: function(req, res, model) {
    var Model = {
      'user': UserModel,
      'transaction': TransactionModel,
      'account': AccountModel
    };

    if (!Model[model]) {
      response.error(res, 'Invalid model param');
    } else {
      Model[model].update(true, {
        isDeleted: false
      }, handler(res, function() {
        response.success(res);
      }));
    }
  },

  allUsers: function(req, res) {
    UserModel.paginateQuery(req, UserModel.find())
      .select('-__v')
      .exec(handler(res, function(users) {
        response.send(res, users);
      }));
  },

  user: function(req, res, userId) {
    UserModel.findById(userId)
      .select('-__v')
      .exec(handler(res, function(user) {
        response.send(res, user);
      }));
  },

  deleteUser: function(req, res, userId) {
    UserModel.remove({
      _id: userId
    }, handler(res, function() {
      response.deleteSuccess(res);
    }));
  },

  allAccounts: function(req, res) {
    AccountModel.paginateQuery(req, AccountModel.find())
      .select('-__v')
      .exec(handler(res, function(accounts) {
        response.send(res, accounts);
      }));
  },

  account: function(req, res, accountId) {
    AccountModel.findById(accountId, handler(res, function(account) {
      response.send(res, account);
    }));
  },

  deleteAccount: function(req, res, accountId) {
    TransactionModel.remove({
      account: accountId
    }).exec(handler(res, function() {
      AccountModel.remove({
        _id: accountId
      }).exec(handler(res, function() {
        response.deleteSuccess(res);
      }));
    }));
  },

  accountDetails: function(req, res, accountId) {
    var accountInfo = {};
    AccountModel.findById(accountId, handler(res, function(notPopulatedAccount) {
      accountInfo.account = notPopulatedAccount.toJSON();

      // TransactionModel.find({
      //   account: accountId
      // }).populate('user').exec(handler(res, function(collabs) {
      //   accountInfo.transactions = collabs.toJSON();

      //   TransactionModel.find({
      //     account: accountId
      //   }, function(acts) {
      //     accountInfo.activities = acts.toJSON();

      response.send(accountInfo);
      //   });
      // }));
    }));
  },

  allTransactions: function(req, res) {
    TransactionModel.paginateQuery(req, TransactionModel.find())
      .populate('user account')
      .exec(handler(res, function(transactions) {
        response.send(res, transactions);
      }));
  },

  transaction: function(req, res, transactionId) {
    TransactionModel.findById(transactionId)
      .populate('user account')
      .select('-__v')
      .exec(handler(res, function(transactions) {
        response.send(res, transactions);
      }));
  },

  deleteTransaction: function(req, res, transactionId) {
    TransactionModel.remove({
      _id: transactionId
    }).exec(handler(res, function() {
      response.deleteSuccess(res);
    }));
  },

  allActivities: function(req, res) {
    TransactionModel.paginateQuery(req, TransactionModel.find()).exec(handler(res, function(activities) {
      response.send(res, activities);
    }));
  },

  beforeFilters: _.defaults({
    authenticateAdmin: function(req, res, next) {
      if (req.query.pokemon === 'pikachu') {
        next();
      } else {
        response.unauthorized(res);
      }
    }
  }, BaseApiController.prototype.beforeFilters)
});

module.exports = new AdminController();
