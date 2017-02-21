'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactHelmet = require('react-helmet');

var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

var _server = require('react-dom/server');

var _server2 = require('glamor/server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Layout = function (_React$Component) {
  _inherits(Layout, _React$Component);

  function Layout() {
    _classCallCheck(this, Layout);

    return _possibleConstructorReturn(this, (Layout.__proto__ || Object.getPrototypeOf(Layout)).apply(this, arguments));
  }

  _createClass(Layout, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          _props$assets = _props.assets,
          assets = _props$assets === undefined ? [] : _props$assets,
          children = _props.children,
          _props$routes = _props.routes,
          routes = _props$routes === undefined ? [] : _props$routes,
          _props$hydrate = _props.hydrate,
          hydrate = _props$hydrate === undefined ? {} : _props$hydrate;

      var content = (0, _server.renderToString)(children);

      var _renderStatic = (0, _server2.renderStatic)(function () {
        return content;
      }),
          css = _renderStatic.css,
          ids = _renderStatic.ids;

      var _Helmet$rewind = _reactHelmet2.default.rewind(),
          head = _Helmet$rewind.head;

      return _react2.default.createElement(
        'html',
        { lang: 'en-us' },
        _react2.default.createElement(
          'head',
          null,
          _react2.default.createElement('meta', { name: 'theme-color', content: '#db5945' }),
          _react2.default.createElement('link', { rel: 'shortcut icon', href: '/favicon.ico' }),
          _react2.default.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
          assets.filter(function (path) {
            return path.endsWith('.css');
          }).map(function (path) {
            return _react2.default.createElement('link', { rel: 'stylesheet', key: path, href: path });
          }),
          _react2.default.createElement(
            'style',
            { id: 'rakt-css' },
            '$',
            css || ''
          )
        ),
        _react2.default.createElement(
          'body',
          null,
          _react2.default.createElement('div', { id: 'root', dangerouslySetInnerHTML: { __html: content } }),
          _react2.default.createElement('noscript', { id: 'rakt-cssids', 'data-cssids': JSON.stringify(ids) }),
          _react2.default.createElement('noscript', { id: 'rakt-routes', 'data-routes': JSON.stringify(routes) }),
          _react2.default.createElement('noscript', { id: 'rakt-ssr', 'data-ssr': JSON.stringify(hydrate) }),
          assets.filter(function (path) {
            return path.endsWith('.js');
          }).map(function (path) {
            return _react2.default.createElement('script', { key: path, src: '/' + path });
          }),
          _react2.default.createElement('script', { dangerouslySetInnerHTML: { __html: 'window.__init()' } })
        )
      );
    }
  }]);

  return Layout;
}(_react2.default.Component);

exports.default = Layout;