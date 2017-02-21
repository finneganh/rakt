#! /usr/bin/env node
"use strict";

require('babel-register')({
  "presets": ["es2015", "stage-0", "react"],
  "plugins": [[require.resolve("./babel.js"), { server: true }], "transform-decorators-legacy"]
});

var path = require('path');

var server = require('./server').default;
var serve = server({ entry: require.resolve(path.resolve(process.argv[2])) });

serve.listen(3000, function (err) {
  if (err) {
    return console.error(err);
  }
  console.log('listening on', 3000);
});