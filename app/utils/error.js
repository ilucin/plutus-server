'use strict';

function createError(name) {

  function CustomError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = name;
    this.message = message;
  }
  CustomError.prototype = new Error();
  return CustomError;
}

module.exports = createError;