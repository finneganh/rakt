'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _ = require('./');

var _reactRouterDom = require('react-router-dom');

var _reactHelmet = require('react-helmet');

var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

var _glamor = require('glamor');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global $ENTRY */

function dehydrate(name) {
  return JSON.parse(document.getElementById('rakt-' + name).dataset[name]);
}

(0, _glamor.rehydrate)(dehydrate('cssids'));

var App = require($ENTRY);
App = App.default || App;

// do anything else critical here
// service worker registration etc
// if ssr was off, you could start right away

window.__init = function () {
  return (0, _reactDom.render)(_react2.default.createElement(
    _reactRouterDom.BrowserRouter,
    null,
    _react2.default.createElement(
      _.Rakt,
      { cache: dehydrate('ssr'),
        routes: dehydrate('routes') },
      _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_reactHelmet2.default, { title: 'Home' }),
        _react2.default.createElement(App, null)
      )
    )
  ), document.getElementById('root'));
};