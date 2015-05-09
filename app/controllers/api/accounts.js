'use strict';

var BaseApiController = require('./base');
var AccountModel = require('../../models/account');
var TransactionModel = require('../../models/transaction');
var UserModel = require('../../models/user');
var safeSave = require('../../utils/safe-save');
var response = require('../../utils/response');
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

  create: function(req, res, data) {
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
    var validationError = TransactionModel.validateAmount(data.amount);
    if (validationError) {
      return response.error(res, validationError, response.HttpStatus.BAD_REQUEST);
    }

    var amount = parseFloat(data.amount, 10);

    var transaction = new TransactionModel({
      amount: amount
    });
    transaction.user = req.user;
    transaction.account = req.account;

    req.account.updateBalance(amount);

    safeSave([transaction, req.account], handler(res, function() {
      res.send({
        account: req.account,
        transaction: transaction
      });
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
        .select('-__v')
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
