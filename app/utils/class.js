'use strict';

var extendClass = function(properties) {
  var parent = this;
  var child = function() {
    parent.apply(this, arguments);
  };
  _.extend(child.prototype, parent.prototype, properties);
  child.inherit = child.extend = extendClass;
  return child;
};

var Class = function() {};

Class.inherit = Class.extend = extendClass;

module.exports = Class;