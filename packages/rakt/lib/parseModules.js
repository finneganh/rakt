'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var glob = require("glob");

var hash = require('glamor/lib/hash').default;

function hashify(path) {
  return hash(path).toString(36);
}

module.exports = function (entry) {
  var ret = {};
  var dir = _path2.default.dirname(entry);
  var files = glob.sync(dir + '/*.js', {});
  files.forEach(function (file) {
    return ret[hashify(file)] = file;
  });
  return ret;
};