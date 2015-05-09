'use strict';

var Mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var createError = require('./error');

function createSchema(name, definition) {

  var schema = new Mongoose.Schema(_.defaults(definition, {
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }));

  mongoosePaginate(schema);

  schema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });

  schema.Error = createError(name + 'SchemaError');

  schema.getError = function(err) {
    return new schema.Error(err || 'Something went wrong.');
  };

  return schema;
}

module.exports = createSchema;
