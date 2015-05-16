'use strict';

var BaseApiController = require('./base');
var AccountModel = require('../../models/account');
var TransactionModel = require('../../models/transaction');
var safeSave = require('../../utils/safe-save');
var response = require('../../utils/response');
var money = require('../../utils/money');
var Msg = response.Messages;
var handler = response.handler;

function accountById(res, accountId, select) {
  AccountModel.findById(accountId).lean().select(select || '-__v').exec(handler(res, function(account) {
    if (!account) {
      response.error(res, Msg.NO_BOARD);
    } else {
      response.send(res, account);
    }
  }));
}

var AccountsController = BaseApiController.extend({
  beforeAction: {
    'authenticate': '*',
    'getAccount': 'addCorrection, transactions, getTransaction, remove, update, details, createTransaction, updateTransaction',
    'getTransaction': 'getTransaction, updateTransaction'
  },

  remove: function(req, res, userId, accountId) {
    TransactionModel.remove({
      account: accountId
    }, handler(res, function() {
      AccountModel.remove({
        _id: accountId
      }, handler(res, function() {
        response.deleteSuccess(res);
      }));
    }));
  },

  create: function(req, res, userId, data) {
    var account = new AccountModel(data);
    account.user = req.user;

    safeSave([account], handler(res, function() {
      accountById(res, account._id);
    }));
  },

  update: function(req, res, userId, accountId, data) {
    req.account.set('name', data.name);
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

  createTransaction: function(req, res, userId, accountId, data) {
    if (!data || !data.type || (data.type !== 'income' && data.type !== 'expense')) {
      return response.error(res, 'Invalid transaction', response.HttpStatus.BAD_REQUEST);
    }

    data.amount = money.parse(data.amount);

    var transaction = new TransactionModel(data);
    transaction.account = req.account._id;
    transaction.user = req.user._id;

    var newBalance = req.account.balance;
    if (data.type === 'income') {
      newBalance += data.amount;
    } else {
      newBalance -= data.amount;
    }
    req.account.set('balance', newBalance);

    safeSave([req.account, transaction], handler(res, function() {
      response.send(res, {
        account: req.account,
        transaction: transaction
      });
    }));
  },

  updateTransaction: function(req, res, userId, accountId, transactionId, data) {
    if (!data || !data.type || (data.type !== 'income' && data.type !== 'expense')) {
      return response.error(res, 'Invalid transaction', response.HttpStatus.BAD_REQUEST);
    }

    data.amount = money.parse(data.amount);
    delete data.account;
    delete data.user;

    var transaction = req.transaction;
    var account = req.account;

    if (!transaction || !account) {
      return response.error(res, 'Invalid data');
    }

    var diffAmount = 0;
    if (data.type === 'income') {
      if (transaction.type === 'income') {
        diffAmount = data.amount - transaction.amount;
      } else {
        diffAmount = data.amount + transaction.amount;
      }
    } else {
      if (transaction.type === 'income') {
        diffAmount = -(data.amount + transaction.amount);
      } else {
        diffAmount = -(data.amount - transaction.amount);
      }
    }

    transaction.set(data);
    account.set('balance', account.balance + diffAmount);

    safeSave([account, transaction], handler(res, function() {
      response.send(res, {
        account: account,
        transaction: transaction
      });
    }));
  },

  transactions: function(req, res, userId, accountId) {
    TransactionModel.find({
      user: userId,
      account: accountId
    }).lean().select('-__v -updatedAt').exec(handler(res, function(transactions) {
      response.send(res, transactions);
    }));
  },

  getTransaction: function(req, res, userId, accountId, transactionId) {
    TransactionModel.findById(transactionId).lean().select('-__v -updatedAt').exec(handler(res, function(transactions) {
      response.send(res, transactions);
    }));
  },

  removeTransaction: function(req, res, userId, accountId, transactionId) {
    AccountModel.update({
      _id: accountId
    }, {
      balance: req.account.balance - req.transaction.amount
    }, handler(res, function() {
      TransactionModel.remove({
        _id: transactionId
      }, handler(res, function() {
        accountById(res, accountId);
      }));
    }));
  },

  beforeFilters: _.defaults({
    getAccount: function(req, res, next) {
      var accountId = req.param('accountId');
      AccountModel.findById(accountId).select('-__v -user -updatedAt').exec(handler(res, function(account) {
        if (!account) {
          response.send404(res, Msg.NO_ACCOUNT);
        } else {
          req.account = account;
          next();
        }
      }));
    },
    getTransaction: function(req, res, next) {
      var transactionId = req.param('transactionId');
      TransactionModel.findById(transactionId).select('-__v -updatedAt').exec(handler(res, function(transaction) {
        if (!transaction) {
          response.send404(res, Msg.NO_TRANSACTION);
        } else {
          req.transaction = transaction;
          next();
        }
      }));
    }
  }, BaseApiController.prototype.beforeFilters)
});

module.exports = new AccountsController();
