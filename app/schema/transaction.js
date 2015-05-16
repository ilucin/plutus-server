'use strict';

var Mongoose = require('mongoose');
var createSchema = require('../utils/schema');

var transactionSchema = createSchema('Transaction', {
  type: {
    type: String,
    enum: ['expense', 'income']
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
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
