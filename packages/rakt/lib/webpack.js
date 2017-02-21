'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.webpackify = webpackify;

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // copied from ratpack


function webpackify(filepath) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


  var webpackCompiler = (0, _webpack2.default)({
    devtool: options.production ? false : options.devtool || 'cheap-module-source-map',
    entry: [options.reload !== false || options.production !== true ? require.resolve('react-dev-utils/webpackHotDevClient.js') : undefined, options.stats ? require.resolve('./stats.js') : undefined, require.resolve('./polyfills'), options.offline ? require.resolve('./offline-plugin-runtime.js') : undefined, filepath].filter(function (x) {
      return !!x;
    }),
    output: {
      path: _path2.default.join(__dirname, '../public'),
      pathinfo: true,
      filename: 'bundle.js'
    },
    performance: {
      hints: false
    },
    module: {
      rules: [].concat(_toConsumableArray((options.rules || []).map(function (_ref) {
        var loader = _ref.loader,
            files = _ref.files,
            options = _ref.options;
        return { loader: require.resolve(loader), options: options, test: glob2regexp(files || '*') };
      })), [{
        enforce: 'pre',
        test: /\.(js|jsx)$/,
        loader: require.resolve('eslint-loader'),
        exclude: /node_modules/,
        options: {
          configFile: _path2.default.join(__dirname, '../resources/.eslintrc')
        }
      }, {
        exclude: [/\.html$/, /\.(js|jsx)$/, /\.css$/, /\.json$/, /\.svg$/],
        loader: require.resolve('url-loader'),
        query: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: require.resolve('babel-loader'),
        options: {
          'presets': [[require('babel-preset-env'), {
            'targets': {
              'browsers': ['last 2 versions', 'safari >= 7']
            },
            modules: false
          }], require('babel-preset-stage-0'), require('babel-preset-react')].concat(_toConsumableArray((options.babel || {}).presets || [])),
          'plugins': [[require.resolve('babel-plugin-transform-runtime'), {
            helpers: false,
            polyfill: false,
            regenerator: true
            // Resolve the Babel runtime relative to the config.
            // moduleName: path.dirname(require.resolve('babel-runtime/package'))
          }], options.jsx ? [require('babel-plugin-transform-react-jsx'), { 'pragma': options.jsx }] : undefined, require('babel-plugin-transform-decorators-legacy').default, require('babel-plugin-transform-react-require').default].concat(_toConsumableArray((options.babel || {}).plugins || [])).filter(function (x) {
            return !!x;
          }),
          cacheDirectory: false
        }
      }, {
        test: /\.css$/,
        use: [require.resolve('style-loader'), {
          loader: require.resolve('css-loader'),
          options: { importLoaders: 1 }
        }, require.resolve('postcss-loader') // options in the plugins section below
        ]
      },
      // {
      //   test: /\.json$/,
      //   loader: require.resolve('json-loader')
      // },
      {
        test: /\.svg$/,
        loader: require.resolve('file-loader'),
        query: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }])
    },
    resolve: {
      alias: options.alias || {},
      extensions: ['.js', '.json', '.jsx'],
      // todo - windows
      modules: ['node_modules', _path2.default.join(app.getPath('home'), '.ratpack/node_modules'), _path2.default.join(__dirname, '../node_modules')]
    },
    plugins: [new _webpack2.default.DefinePlugin(_extends({
      'process.env.NODE_ENV': JSON.stringify(options.production && 'production' || process.env.NODE_ENV || 'development')
    }, Object.keys(options.define || {}).reduce(function (o, key) {
      return _extends({}, o, _defineProperty({}, key, JSON.stringify(options.define[key])));
    }, {}))), options.offline ? new OfflinePlugin(options.offline === true ? {} : options.offline) : undefined, new _webpack2.default.ProvidePlugin(options.provide || {}), new _webpack2.default.LoaderOptionsPlugin({
      test: /\.css$/,
      debug: true,
      options: {
        postcss: [autoprefixer({
          browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9' // React doesn't support IE8 anyway
          ]
        })]
      }
    })].filter(function (x) {
      return !!x;
    }),
    stats: 'errors-only',
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  });

  var webpackServer = new WebpackDevServer(webpackCompiler, {
    // todo - windows
    contentBase: [options.public ? _path2.default.join(_path2.default.dirname(filepath), options.public) : '', _path2.default.join(_path2.default.dirname(filepath), 'public'), _path2.default.join(__dirname, '../public')].filter(function (x) {
      return !!x;
    }),
    historyApiFallback: true,
    compress: true,
    proxy: options.proxy || {},
    // setup()
    // staticOptions

    quiet: true,
    stats: { colors: false }
  });
  // this is to workaround some weird bug where webpack keeps the first loaded file
  // also makes it look cool ha
  var h = hash(filepath, filepath.length) + '';
  var port = options.port || 3000 + parseInt(h.substr(h.length - 4), 10);
  webpackServer.listen(port);
  openBrowser('http://localhost:' + port);
  return { webpackServer: webpackServer, webpackCompiler: webpackCompiler, port: port };
}