'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = server;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _parseModules = require('./parseModules');

var _parseModules2 = _interopRequireDefault(_parseModules);

var _parseRoutes = require('./parseRoutes');

var _parseRoutes2 = _interopRequireDefault(_parseRoutes);

var _walkTree = require('./walkTree');

var _walkTree2 = _interopRequireDefault(_walkTree);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

require('isomorphic-fetch');

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _server = require('react-dom/server');

var _reactRouter = require('react-router');

var _layout = require('./layout');

var _layout2 = _interopRequireDefault(_layout);

var _2 = require('./');

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _reactHelmet = require('react-helmet');

var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
// import historyApiFallback from 'connect-history-api-fallback'

// let oldRender = Route.render

// // when you're not applying babel plugin on server files
// Route.render = (props) => {
//   let { module, match, absolute } = props
//   console.log({absolute})
//   if(module && match){

//     let Module = require(absolute)
//     console.log('sadasdasd')
//     return oldRender({...props, match, Module})
//   }
//   return oldRender(props)
// }

function getInitialModsFromTree(_ref) {
  var rootElement = _ref.rootElement,
      _ref$rootContext = _ref.rootContext,
      rootContext = _ref$rootContext === undefined ? {} : _ref$rootContext;
  var fetchRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  var mods = [];

  (0, _walkTree2.default)(rootElement, rootContext, function (element, instance, context) {
    var skipRoot = !fetchRoot && element === rootElement;
    var Component = element.type;

    // look for a Data element
    if (instance && typeof Component.mod === 'function' && !skipRoot) {
      mods.push({ mod: Component.mod, modhash: Component.modhash, element: element, context: context });
      return false;
    }
  });

  return mods;
}

function primeApiCache(req, cache, errors, rootElement) {
  var rootContext = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var fetchRoot = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;

  var mods = getInitialModsFromTree({ rootElement: rootElement, rootContext: rootContext }, fetchRoot);
  if (!mods.length) return Promise.resolve();

  var mappedMods = mods.map(function (_ref2) {
    var mod = _ref2.mod,
        modhash = _ref2.modhash,
        element = _ref2.element,
        context = _ref2.context;

    return new Promise(function (resolve, reject) {
      mod({ req: req, done: function done(err, data) {
          var cacheKey = modhash + ':' + req.url;
          if (err) {
            errors[cacheKey] = err;
          } else {
            cache[cacheKey] = data;
          }

          resolve();
        } });
    }).then(function (_) {
      return primeApiCache(req, cache, errors, element, context, false);
    });
  });

  return Promise.all(mappedMods).then(function (_) {
    return null;
  });
}

function server(_ref3) {
  var entry = _ref3.entry;


  var App = require(entry);
  App = App.default || App;

  var modules = (0, _parseModules2.default)(entry);
  var routes = (0, _parseRoutes2.default)(entry);

  var compiler = (0, _webpack2.default)({
    devtool: "source-map",
    entry: [entry, require.resolve('./client.js')],
    output: {
      path: __dirname, // todo - ?
      publicPath: '/',
      filename: "[name].bundle.js",
      chunkFilename: "[name].chunk.js"
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          "presets": ["es2015", "stage-0", "react"],
          "plugins": [require.resolve("./babel.js"), require.resolve("./babel2.js"), "transform-decorators-legacy"]
        }
      }, {
        test: /\.js$/,
        loader: require.resolve('./loader.js'),
        query: {
          entry: entry
        }
      }]
    }
  });
  // webpack dev server

  var app = (0, _express2.default)();

  // app.use(historyApiFallback({ verbose: false }));
  app.use((0, _webpackDevMiddleware2.default)(compiler, {
    // noInfo: true,
    // publicPath: '/app'
  }));

  app.use((0, _webpackHotMiddleware2.default)(compiler));

  app.use((0, _serveFavicon2.default)('./favicon.png'));

  app.use('/api/:mod/*', function (req, res, next) {
    // todo - feed the matches that got here, since the url isn't reliable
    var mod = require(modules[req.params.mod]);
    mod = mod.default ? mod.default : mod;
    if (mod.mod) {
      // todo - deep?
      mod.mod({
        req: req, res: res, next: next,
        done: function done(err, data) {
          return err ? next(err) : res.send(data);
        }
      });
    } else {
      next(404);
    }
  });

  app.get('*', function (req, res, next) {
    // how to ignore
    // fetch data

    var matches = routes.filter(function (_ref4) {
      var path = _ref4.path,
          exact = _ref4.exact,
          strict = _ref4.strict;
      return (0, _reactRouter.matchPath)(req.url, path, { exact: exact, strict: strict });
    });

    var cache = {};
    var errors = {};
    var context = {};

    var site = _react2.default.createElement(
      _reactRouter.StaticRouter,
      { location: req.url, context: context },
      _react2.default.createElement(
        _2.Rakt,
        { cache: cache, errors: errors },
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(_reactHelmet2.default, { title: 'Home' }),
          _react2.default.createElement(App, null)
        )
      )
    );

    primeApiCache(req, cache, errors, site).then(function () {
      var html = (0, _server.renderToString)(_react2.default.createElement(
        _layout2.default,
        { assets: ['main.bundle.js'].concat(_toConsumableArray(matches.map(function (x) {
            return x.hash + '.chunk.js';
          }))),
          routes: routes.map(function (_ref5) {
            var module = _ref5.module,
                rest = _objectWithoutProperties(_ref5, ['module']);

            return rest;
          }),
          hydrate: cache },
        site
      ));
      res.type('html');
      res.send('<!doctype html>' + html);
    });
  });
  return app;
  // when do we 404?
}