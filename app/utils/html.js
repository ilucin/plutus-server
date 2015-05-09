'use strict';

function Html() {
  this.html = '';
}

var tagStyles = {
  'h1': 'line-height: 32px',
  'h2': 'line-height: 30px'
};

function el(tag, content, attrs) {
  var res = '<' + tag + '';
  if (tagStyles[tag]) {
    res += ' style="' + tagStyles[tag] + '"';
  }

  if (_.isObject(attrs)) {
    _.each(attrs, function(val, key) {
      res += (' ' + key + '="' + val + '"');
    });
  }

  res += '>' + content + '</' + tag + '>';
  return res;
}


Html.el = el;

_.extend(Html.prototype, {

  add: function(tag, content) {
    var _this = this;
    if (_.isString(tag)) {
      if (_.isString(content)) {
        this.html += el(tag, content);
      } else {
        this.html += tag;
      }
    } else if (_.isArray(tag)) {
      _.each(tag, function(oneEl) {
        if (_.isArray(oneEl)) {
          _this.html += el(oneEl[0], oneEl[1]);
        } else {
          _this.html += oneEl;
        }
      });
    }
    return this;
  },

  addFooter: function() {
    this.html += '<a href="http://plutus.io" style="margin-top: 15px; font-size: 14px; color: #999;"> Plutus.io </p>';
    return this;
  },

  toString: function() {
    return this.html;
  }
});

module.exports = Html;
