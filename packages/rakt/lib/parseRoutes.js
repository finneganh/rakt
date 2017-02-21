'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _babylon = require('babylon');

var babylon = _interopRequireWildcard(_babylon);

var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var glob = require("glob");

var hash = require('glamor/lib/hash').default;

function hashify(path) {
  return hash(path).toString(36);
}

function clean(obj) {
  var ret = {};
  Object.keys(obj).forEach(function (key) {
    if (obj[key] !== undefined) {
      if (obj[key] === null) {
        ret[key] = true;
        return;
      }
      ret[key] = obj[key];
    }
  });
  return ret;
}

module.exports = function (entry) {
  var ret = [];
  var dir = _path2.default.dirname(entry);
  var files = glob.sync(dir + '/*.js', {});
  files.forEach(function (file) {
    var src = _fs2.default.readFileSync(file, 'utf8');

    var ast = babylon.parse(src, {
      plugins: ['*'],
      sourceType: 'module'
    });

    (0, _babelTraverse2.default)(ast, {
      enter: function enter(_ref) {
        var node = _ref.node,
            type = _ref.type;

        function getAttr(name) {
          var ret = node.openingElement.attributes.filter(function (attr) {
            return attr.name.name === name;
          })[0];
          ret = ret ? ret.value : ret;
          ret = ret ? ret.value : ret;
          return ret;
        }

        if (type === 'JSXElement' && node.openingElement.name.name === "Route") {
          var _module = getAttr("module");

          if (_module) {
            var modPath = _path2.default.join(dir, _module);
            var mod = require(modPath);
            mod = mod.default || mod;

            ret.push(clean({
              initial: !!mod.mod,
              module: modPath,
              path: getAttr("path"),
              exact: getAttr("exact"),
              strict: getAttr("strict"),
              hash: hashify(_path2.default.join(dir, getAttr("module")))
            }));
          }
        }
      }
    });
  });

  return ret;
};