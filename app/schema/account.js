'use strict';

var Mongoose = require('mongoose');
var createSchema = require('../utils/schema');

var accountSchema = createSchema('Account', {
  name: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true
  },
  user: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  }
});

module.exports = accountSchema;
