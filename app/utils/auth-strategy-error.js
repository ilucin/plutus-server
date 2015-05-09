'use strict';

module.exports = function(name) {
  return function(done, err, msg) {
    console.log(name + ' error:', err, msg);
    done(err, false, {
      message: msg || 'An error occurred'
    });
  };
};
