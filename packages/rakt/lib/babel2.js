'use strict';

var hash = require('glamor/lib/hash').default;

function hashify(path) {
  return hash(path).toString(36);
}

module.exports = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      ClassDeclaration: function ClassDeclaration(path) {
        // test if react component 
        var decorators = path.node.decorators;
        if (decorators) {

          var dataDeco = decorators.filter(function (x) {
            return x.expression.type === 'CallExpression' && x.expression.callee.name === 'initial';
          })[0];
          if (dataDeco) {

            var modPath = path.hub.file.opts.filename;
            dataDeco.expression.arguments[0] = t.StringLiteral(hashify(modPath));
          }
        }
      }
    }
  };
};