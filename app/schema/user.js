'use strict';

var Mongoose = require('mongoose');
var createSchema = require('../utils/schema');

var UserSchemaErrors = {
  DUPLICATE_KEY: 11000
};

var ErrorMessages = {};
ErrorMessages[UserSchemaErrors.DUPLICATE_KEY] = 'User already exists.';

var userSchema = createSchema('User', {
  authToken: String,
  email: {
    type: String,
    set: function(v) {
      return v.toLowerCase().trim();
    },
    required: true,
    index: {
      unique: true
    }
  },
  password: String,
  name: {
    type: String,
    default: ''
  },
  accounts: [{
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'accounts'
  }],
  categories: [{
    type: Mongoose.Schema.Types.Mixed
  }],
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordSentAt: {
    type: Date,
    default: null
  },
  lastTokenActionAt: {
    type: Date,
    default: null
  }
});

userSchema.getError = function(err) {
  return new userSchema.Error((err && ErrorMessages[err.code]) ? ErrorMessages[err.code] : ((err ? err.message : null) || 'Something went wrong.'));
};

module.exports = userSchema;
