'use strict';

var createModel = require('../utils/model');
var accountSchema = require('../schema/account');

var AccountModel = createModel('Account', 'accounts', accountSchema, {
  populateString: 'user',
  selectString: '-__v',

  updateBalance: function(val) {
    this.balance += val;
  }
});

AccountModel.getDefaultAccounts = function(userId) {
  return [
    new AccountModel({
      name: 'Cash',
      balance: 0,
      user: userId
    }),

    new AccountModel({
      name: 'Card',
      balance: 0,
      user: userId
    })
  ];
};

module.exports = AccountModel;
