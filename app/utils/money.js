'use strict';

var config = require('../../config/config');
var MAX_AMOUNT = config.maxTransactionAmount;

var money = {
  validate: function(val) {
    if (isNaN(val)) {
      return 'Invalid money amount';
    }
  },

  validateUnparsed: function(val) {
    return money.validate(money.parse(val));
  },

  parse: function(val) {
    return Math.floor(parseFloat(val, 10) * 100) / 100;
  },

  validateTransactionAmount: function(val) {
    val = money.parse(val);

    if (isNaN(val)) {
      return 'Invalid money amount';
    } else if (val === 0) {
      return 'Transaction value can\'t be zero.';
    } else if (val > MAX_AMOUNT) {
      return 'Max transaction amount is ' + MAX_AMOUNT + '.';
    } else if (val < -MAX_AMOUNT) {
      return 'Min transaction amount is -' + MAX_AMOUNT + '.';
    } else {
      return;
    }
  }
};

module.exports = money;
