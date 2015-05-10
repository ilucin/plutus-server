'use strict';

var createModel = require('../utils/model');
var transactionSchema = require('../schema/transaction');

var TransactionModel = createModel('Transaction', 'transactions', transactionSchema, {
  selectString: '-__v'
});

module.exports = TransactionModel;
