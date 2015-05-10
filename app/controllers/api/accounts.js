'use strict';

var BaseApiController = require('./base');
var AccountModel = require('../../models/account');
var TransactionModel = require('../../models/transaction');
var UserModel = require('../../models/user');
var safeSave = require('../../utils/safe-save');
var response = require('../../utils/response');
var money = require('../../utils/money');
var Msg = response.Messages;
var handler = response.handler;

function accountById(res, accountId, select) {
  AccountModel.findById(accountId).lean()
    .select(select || '-__v')
    .exec(handler(res, function(account) {
      if (!account || !!account.isDeleted) {
        response.error(res, Msg.NO_BOARD);
      } else {
        response.send(res, account);
      }
    }));
}

var AccountsController = BaseApiController.extend({
  beforeAction: {
    'authenticate': '*',
    'getAccount': 'addCorrection'
  },

  remove: function(req, res) {},

  create: function(req, res, userId, data) {
    var account = new AccountModel(data);
    account.user = req.user;

    safeSave([account], handler(res, function() {
      accountById(res, account._id);
    }));
  },

  update: function(req, res, accountId, data) {
    req.account.set(data);
    req.account.save(handler(res, function() {
      response.send(res, req.account);
    }));
  },

  details: function(req, res) {
    response.send(res, req.account);
  },

  addCorrection: function(req, res, userId, accountId, data) {
    var balance = money.parse(data.balance);
    var validationError = money.validate(balance);
    if (validationError) {
      return response.error(res, validationError, response.HttpStatus.BAD_REQUEST);
    }

    var diff = balance - req.account.balance;

    if (Math.abs(diff) < 1) {
      return response.error(res, 'Account balance hasn\'t changed');
    }

    var transaction = new TransactionModel({
      amount: diff
    });
    transaction.user = req.user;
    transaction.account = req.account;

    req.account.balance = balance;

    safeSave([transaction, req.account], handler(res, function() {
      TransactionModel.findById(transaction._id).lean().select('-__v -updatedAt').exec(handler(res, function(t) {
        res.send({
          account: req.account,
          transaction: t
        });
      }));
    }));
  },

  transactions: function() {

  },

  getTransaction: function() {

  },

  updateTransaction: function() {

  },

  removeTransaction: function() {

  },

  beforeFilters: _.defaults({
    getAccount: function(req, res, next) {
      var accountId = req.param('accountId');
      AccountModel.findById(accountId)
        .select('-__v -user -createdAt -updatedAt')
        .exec(handler(res, function(account) {
          if (!account || !!account.isDeleted) {
            response.send404(res, Msg.NO_BOARD);
          } else {
            req.account = account;
            next();
          }
        }));
    }
  }, BaseApiController.prototype.beforeFilters)
});

module.exports = new AccountsController();
