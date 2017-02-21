'use strict';

var babylon = require("babylon");
var hash = require('glamor/lib/hash').default;

var nodepath = require('path');

function hashify(path) {
  return hash(path).toString(36);
}

// todo - implement warnings for - 
// NB: for great perf, `path` and `module` must be string literals, 
// and `render`/`children` should not be spread as `{...props}`


function wrap(SOURCE, name, absolute, server) {
  var hashed = hashify(absolute);
  var path = JSON.stringify(name);
  // todo - use imports instead of requires 
  return 'require(\'rakt\').wrap(' + SOURCE + ', { \n    module: ' + path + ', \n     ' + (server ? 'absolute: \'' + absolute + '\',' : '') + '\n    load: done =>\n      require(\'rakt\').ensure(require.resolveWeak(' + path + '), \n        () => require.ensure([], require => require(' + path + '), \'' + hashed + '\'),  \n        done)      \n  })';
}

// don't add new props or anything here 
// else render/children will behave differently 

var defaultSrc = 'require(\'rakt\').defaultRender';

module.exports = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      JSXElement: function JSXElement(path, state) {
        var src = path.hub.file.code;

        function getAttr(name) {
          var ret = path.node.openingElement.attributes.filter(function (attr) {
            return attr.name.name === name;
          })[0];
          ret = ret ? ret.value : undefined;
          return ret;
        }

        if (path.node.openingElement.name.name === "Route") {
          (function () {
            // todo - make sure module is a string 
            // todo - make sure path is a static string (for SSR)
            // todo - export name 
            // todo - defer 

            // if component, throw error
            // if render, wrap
            // if children, wrap
            // else, send own render prop
            var attrModule = getAttr("module");
            var attrComponent = getAttr('component');
            if (attrModule && attrComponent) {
              throw new Error('cannot use module and component together');
            }

            if (attrModule) {
              (function () {
                var attrRender = getAttr("render");
                var attrChildren = path.node.children.filter(function (attr) {
                  return attr.type !== 'JSXText';
                })[0];
                // todo ^ - make this better 
                var absolute = require.resolve(nodepath.join(nodepath.dirname(path.hub.file.opts.filename), attrModule.value));[attrRender, attrChildren].forEach(function (X) {

                  var pts = X ? X.expression ? X.expression : X : X;
                  var xSrc = X ? src.substring(pts.start, pts.end) : defaultSrc;
                  var wrapped = X ? wrap(xSrc, attrModule.value, absolute, state.opts.server) : null;
                  if (wrapped) {
                    X.expression = babylon.parse(wrapped, {
                      plugins: ["*"]
                    }).program.body[0].expression;
                  }
                });

                if (!attrRender && !attrChildren) {
                  var wrapped = wrap(defaultSrc, attrModule.value, absolute, state.opts.server); // todo - 
                  path.node.openingElement.attributes.push(t.jSXAttribute(t.jSXIdentifier('render'), t.jSXExpressionContainer(babylon.parse(wrapped, {
                    plugins: ["*"]
                  }).program.body[0].expression)));
                }
              })();
            }
          })();
        }
      },
      ClassDeclaration: function ClassDeclaration(path) {
        // test if react component 
        var decorators = path.node.decorators;
        if (decorators) {

          var dataDeco = decorators.filter(function (x) {
            return x.expression.type === 'CallExpression' && x.expression.callee.name === 'initial';
          })[0];
          if (dataDeco) {
            var modPath = path.hub.file.opts.filename;
            dataDeco.expression.arguments.push(t.StringLiteral(hashify(modPath)));
          }
        }
      }
    }
  };
};