'use strict';

var crypto = require('crypto');

function sha1(data, updateEnc, digestEnc) {
  var shasum = crypto.createHash('sha1');
  updateEnc = updateEnc || 'utf8';
  digestEnc = digestEnc || 'hex';
  shasum.update(data, updateEnc);
  return shasum.digest(digestEnc);
}

module.exports = {
  sha1: sha1
};