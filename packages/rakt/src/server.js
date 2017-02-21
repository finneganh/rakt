import React from 'react'
import express from 'express'
import path from 'path'
import parseModules from './parseModules'
import parseRoutes from './parseRoutes'
import walkTree from './walkTree'
import webpack from 'webpack'
import 'isomorphic-fetch'

import favicon from 'serve-favicon'

import { renderToString } from 'react-dom/server'
import { StaticRouter, matchPath } from 'react-router'
import Layout from './layout'
import { Rakt } from './'
import devware from 'webpack-dev-middleware'
import hotware from 'webpack-hot-middleware'
// import historyApiFallback from 'connect-history-api-fallback'

import Helmet from 'react-helmet'

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

function getInitialModsFromTree({ rootElement, rootContext = {} }, fetchRoot = true) {
  const mods = [];

  walkTree(rootElement, rootContext, (element, instance, context) => {
    const skipRoot = !fetchRoot && (element === rootElement);
    const Component = element.type;

    // look for a Data element
    if (instance && typeof Component.mod === 'function' && !skipRoot) {
      mods.push({ mod: Component.mod, modhash: Component.modhash, element, context })
      return false;
    }
  });

  return mods;
}

function primeApiCache(req, cache, errors, rootElement, rootContext = {}, fetchRoot = true) {
  let mods = getInitialModsFromTree({ rootElement, rootContext }, fetchRoot);
  if (!mods.length) return Promise.resolve();

  const mappedMods = mods.map(({ mod, modhash, element, context }) =>  {
    return (new Promise((resolve, reject) => {
      mod({req, done: (err, data) => {
        const cacheKey = `${modhash}:${req.url}`
        if (err) {
          errors[cacheKey] = err;
        } else {
          cache[cacheKey] = data;
        }

        resolve();
      }})
    })).then(_ => primeApiCache(req, cache, errors, element, context, false));
  });

  return Promise.all(mappedMods).then(_ => null);
}

export default function server({ entry }){

  let App = require(entry)
  App = App.default || App


  let modules = parseModules(entry)
  let routes = parseRoutes(entry)

  let compiler = webpack({
    devtool: "source-map",
    entry: [entry, require.resolve('./client.js')],
    output: {
      path: __dirname, // todo - ?
      publicPath: '/',
      filename: "[name].bundle.js",
      chunkFilename: "[name].chunk.js"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          query: {
            "presets": [ "es2015", "stage-0", "react" ],
            "plugins": [ require.resolve("./babel.js"), require.resolve("./babel2.js"), "transform-decorators-legacy" ]
          }
        },
        {
          test: /\.js$/,
          loader: require.resolve('./loader.js'),
          query: {
            entry
          }
        }
      ]
    }
  })
  // webpack dev server

  const app = express()

  // app.use(historyApiFallback({ verbose: false }));
  app.use(devware(compiler, {
    // noInfo: true,
    // publicPath: '/app'
  }))

  app.use(hotware(compiler));

  app.use(favicon('./favicon.png'));

  app.use('/api/:mod/*', (req, res, next ) => {
    // todo - feed the matches that got here, since the url isn't reliable
    let mod = require(modules[req.params.mod])
    mod = (mod.default ? mod.default : mod)
    if(mod.mod){
      // todo - deep?
      mod.mod({
        req, res, next,
        done: (err, data) => err ? next(err) : res.send(data)
      })
    }
    else {
      next(404)
    }
  })

  app.get('*', (req, res, next) => {
    // how to ignore
    // fetch data

    let matches = routes.filter(({ path, exact, strict }) =>
      matchPath(req.url, path, { exact, strict }))

    const cache = {};
    const errors = {};
    const context = {};

    const site = (
      <StaticRouter location={req.url} context={context}>
        <Rakt cache={cache} errors={errors}>
          <div>
            <Helmet title="Home" />
            <App />
          </div>
        </Rakt>
      </StaticRouter>
    )

    primeApiCache(req, cache, errors, site).then(() => {
      let html = renderToString(
        <Layout assets={[ 'main.bundle.js', ...matches.map(x => `${x.hash}.chunk.js`)]}
          routes={routes.map(({module, ...rest}) => rest)}
          hydrate={cache}>
          {site}
        </Layout>)
      res.type('html')
      res.send('<!doctype html>' + html)
    });
  })
  return app
  // when do we 404?
}
