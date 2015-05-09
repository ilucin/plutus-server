'use strict';

var createModel = require('../utils/model');
var transactionSchema = require('../schema/transaction');

var MAX_AMOUNT = 100000;

var TransactionModel = createModel('Transaction', 'transactions', transactionSchema, {
  selectString: '-__v'
});

TransactionModel.validateAmount = function(val) {
  val = parseFloat(val);
  if (val === 0) {
    return 'Transaction value can\'t be zero.';
  } else if (val > MAX_AMOUNT) {
    return 'Max transaction amount is ' + MAX_AMOUNT + '.';
  } else if (val < -MAX_AMOUNT) {
    return 'Min transaction amount is -' + MAX_AMOUNT + '.';
  } else {
    return;
  }
};

module.exports = TransactionModel;
