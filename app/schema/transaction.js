'use strict';

var Mongoose = require('mongoose');
var createSchema = require('../utils/schema');

var transactionSchema = createSchema('Transaction', {
  amount: {
    type: Number,
    required: true
  },
  categoryId: Number,
  user: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  account: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'accounts'
  }
});

module.exports = transactionSchema;
