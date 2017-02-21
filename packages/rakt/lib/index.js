"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Rakt = exports.Loading = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _class2, _class3, _temp3;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.initial = initial;
exports.post = post;
exports.put = put;
exports.del = del;
exports.ensure = ensure;
exports.wrap = wrap;
exports.defaultRender = defaultRender;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require("react-router");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isBrowser = typeof window !== "undefined";


var nodeRequire = !isBrowser && function () {
  return eval('require');
}(); //eslint-disable-line no-eval
// todo - a better solution for ^


var Loading = exports.Loading = function (_React$Component) {
  _inherits(Loading, _React$Component);

  function Loading() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Loading);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Loading.__proto__ || Object.getPrototypeOf(Loading)).call.apply(_ref, [this].concat(args))), _this), _this.state = { error: undefined, Module: undefined }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Loading, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      this.props.listen(function (type, x) {
        _this2.setState(_defineProperty({}, type, x));
      });
    }
    // component will recieve props?

  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.props.unlisten();
    }
  }, {
    key: "render",
    value: function render() {
      var _props$args = this.props.args,
          match = _props$args.match,
          history = _props$args.history;
      var _state = this.state,
          error = _state.error,
          Module = _state.Module;

      return this.props.fn({ match: match, history: history, error: error, Module: Module });
    }
  }]);

  return Loading;
}(_react2.default.Component);

// todo - load this only if there are data fetching components
// in the bundle


var Rakt = exports.Rakt = (0, _reactRouter.withRouter)(_class2 = (_temp3 = _class3 = function (_React$Component2) {
  _inherits(Rakt, _React$Component2);

  function Rakt() {
    var _ref2;

    var _temp2, _this3, _ret2;

    _classCallCheck(this, Rakt);

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return _ret2 = (_temp2 = (_this3 = _possibleConstructorReturn(this, (_ref2 = Rakt.__proto__ || Object.getPrototypeOf(Rakt)).call.apply(_ref2, [this].concat(args))), _this3), _this3.inflight = {}, _this3.cache = _this3.props.cache, _this3.errors = _this3.props.errors || {}, _temp2), _possibleConstructorReturn(_this3, _ret2);
  }

  _createClass(Rakt, [{
    key: "url",
    value: function url() {
      return this.props.createHref(this.props.location);
    }
  }, {
    key: "getChildContext",
    value: function getChildContext() {
      var _this4 = this;

      return {
        rakt: {
          fetch: function (_fetch) {
            function fetch(_x, _x2) {
              return _fetch.apply(this, arguments);
            }

            fetch.toString = function () {
              return _fetch.toString();
            };

            return fetch;
          }(function (mod, fn) {
            // if already in flight, attach to that instead
            var url = _this4.url();
            if (_this4.inflight[mod + ":" + url]) {
              _this4.inflight[mod + ":" + url].then(function (x) {
                return fn(undefined, x);
              }, fn);
              return;
            }

            _this4.inflight[mod + ":" + url] = fetch("/api/" + mod + url).then(function (x) {
              return x.json();
            }).then(function (res) {
              _this4.inflight[mod + ":" + url] = undefined;
              _this4.cache[mod + ":" + url] = res;
              fn(undefined, res);
            }, function (error) {
              _this4.inflight[mod + ":" + url] = undefined;
              _this4.errors[mod + ":" + url] = error;
              fn(error);
            });
          }),
          get: function get(mod) {
            return _this4.cache[mod + ":" + _this4.url()];
          },
          getError: function getError(mod) {
            return _this4.errors[mod + ":" + _this4.url()];
          },
          clear: function clear() {
            _this4.cache = {};
          }
        }
      };
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      // unlisten history
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this5 = this;

      // this is the bit that lets you request for data for a module,
      // *before* the chunk even arrives
      this.context.router.listen(function (location) {

        var url = _this5.props.createHref(location);

        var matches = _this5.props.routes.filter(function (_ref3) {
          var path = _ref3.path,
              exact = _ref3.exact,
              strict = _ref3.strict;
          return (0, _reactRouter.matchPath)(url, path, { exact: exact, strict: strict });
        }) // todo - fix basename
        .filter(function (_ref4) {
          var initial = _ref4.initial,
              hash = _ref4.hash;
          return !!initial && !__webpack_modules__[hash] && //eslint-disable-line no-undef // todo - this is wrong
          !_this5.inflight[hash + ":" + url] && !_this5.cache[hash + ":" + url];
        });

        // todo - dedupe
        var promises = matches.map(function (_ref5) {
          var hash = _ref5.hash;
          return fetch("/api/" + hash + url).then(function (x) {
            return x.json();
          });
        });

        // update inflight
        promises.forEach(function (x, i) {
          return _this5.inflight[matches[i].hash + ":" + url] = x;
        });

        Promise.all(promises).then(function (results) {
          return results.forEach(function (result, i) {
            _this5.cache[matches[i].hash + ":" + url] = result;
            _this5.inflight[matches[i].hash + ":" + url] = undefined;
          });
        });
      });
      // listen on url changes
      // find mods which haven't loaded yet
      // make requests
      // fill cache
      // intercept possible requests once module loads
    }
  }, {
    key: "render",
    value: function render() {
      return this.props.children;
    }
  }]);

  return Rakt;
}(_react2.default.Component), _class3.displayName = 'Rakt', _class3.childContextTypes = {
  rakt: _react.PropTypes.object
}, _class3.contextTypes = {
  router: _react.PropTypes.object
}, _temp3)) || _class2;

function initial(mod, modhash) {
  // assuming this has been transpiled to an indentifier mod
  if (isBrowser && typeof mod === 'function') {
    throw new Error('forgot to apply babel plugin');
  }
  // get hash
  return function (Target) {
    var _class4, _temp5;

    return _temp5 = _class4 = function (_React$Component3) {
      _inherits(Data, _React$Component3);

      function Data() {
        var _ref6;

        var _temp4, _this6, _ret3;

        _classCallCheck(this, Data);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp4 = (_this6 = _possibleConstructorReturn(this, (_ref6 = Data.__proto__ || Object.getPrototypeOf(Data)).call.apply(_ref6, [this].concat(args))), _this6), _this6.state = {
          data: _this6.context.rakt.get(!isBrowser ? modhash : mod),
          error: _this6.context.rakt.getError(!isBrowser ? modhash : mod)
        }, _temp4), _possibleConstructorReturn(_this6, _ret3);
      }

      _createClass(Data, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          var _this7 = this;

          if (!this.state.data && !this.state.error) {
            this.context.rakt.fetch(!isBrowser ? modhash : mod, function (error, data) {
              _this7.setState({ error: error, data: data });
            });
          }
        }
      }, {
        key: "render",
        value: function render() {
          if (this.state.error) {
            return _react2.default.createElement(Target, _extends({ error: this.state.error }, this.props));
          }
          return _react2.default.createElement(Target, _extends({ data: this.state.data }, this.props));
        }
      }]);

      return Data;
    }(_react2.default.Component), _class4.mod = mod, _class4.modhash = modhash, _class4.contextTypes = {
      rakt: _react.PropTypes.object
    }, _temp5;
  };
}

function post(mod) {}

function put(mod) {}

function del(mod) {}

function ensure(moduleId, fn, done) {
  if (__webpack_modules__[moduleId]) {
    //eslint-disable-line no-undef
    return done(undefined, __webpack_require__(moduleId)); //eslint-disable-line no-undef
  }
  fn().then(function (Module) {
    return done(undefined, Module);
  }, done);
}

// todo - weakmap cache on fn
function wrap(fn, _ref7) {
  var module = _ref7.module,
      load = _ref7.load,
      defer = _ref7.defer,
      absolute = _ref7.absolute;

  return function (_ref8) {
    var match = _ref8.match,
        history = _ref8.history;


    if (!isBrowser) {
      // todo - defer

      var _Module = match ? nodeRequire(absolute) : undefined;
      return fn({ match: match, history: history, Module: _Module });
    }
    var Module = void 0,
        sync = true,
        error = void 0;
    var listeners = [],
        listen = function listen(fn) {
      return listeners.push(fn);
    },
        unlisten = function unlisten() {
      return listeners = [];
    };

    if (!match) {
      return fn({ match: match, history: history });
    }

    load(function (err, loaded) {
      if (err) {
        // todo - retry?
        if (sync) {
          error = err;
        } else {
          listeners.forEach(function (x) {
            return x("error", err);
          });
        }
        return;
      }
      if (sync) {
        Module = loaded;
      } else {
        listeners.forEach(function (x) {
          return x("Module", loaded);
        });
      }
    });
    sync = false;
    if (error || Module) {
      return fn({ match: match, history: history, Module: Module, error: error });
    } else return _react2.default.createElement(Loading, {
      key: module,
      listen: listen,
      unlisten: unlisten,
      fn: fn,
      args: { match: match, history: history }
    });
  };
}

function defaultRender(_ref9) {
  var Module = _ref9.Module,
      match = _ref9.match,
      rest = _objectWithoutProperties(_ref9, ["Module", "match"]);

  return match && Module ? Module.default ? _react2.default.createElement(Module.default, _extends({ match: match }, rest)) : _react2.default.createElement(Module, _extends({ match: match }, rest)) : null;
}