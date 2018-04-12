const isProd = cubic.config.local.environment !== 'development'
const webpack = require('webpack')
const fs = require('fs')
const path = require('path')

// Plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const extractSass = new ExtractTextPlugin({
  filename: '[name].[contenthash].css',
  allChunks: true,
  disable: !isProd
})

// Super hacky fix for multiple builds in dev mode. Seems to be a very wide
// spread issue, no fix from webpack though, but some awesome people on
// github fixed it: https://github.com/webpack/watchpack/issues/25#issuecomment-368402851
function TimeFixPlugin () {
  this.apply = function (compiler) {
    var timefix = 11000
    compiler.plugin('watch-run', (watching, callback) => {
      watching.startTime += timefix
      callback()
    })
    compiler.plugin('done', (stats) => {
      stats.startTime -= timefix
    })
  }
}

// Config
const vueConfig = require('./vue.config.js')(extractSass)

// Dependencies need to be handled differently in debug (see webpack resolve)
let isDebug = false
try {
  fs.statSync(`${__dirname}/../../../../node_modules`)
} catch (err) {
  isDebug = true
}

// Actual config
module.exports = {

  // Output file which will be loaded by Vue (server & client side)
  output: {
    path: cubic.config.ui.core.publicPath,
    filename: isProd ? '[name].bundle.[chunkhash].js' : '[name].bundle.js'
  },

  // Loaders which determine how file types are interpreted
  module: {
    rules: [
      // This is our main loader for vue files
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueConfig
      },
      // SCSS compiler with extract-text-webpack-plugin to generate one css file
      // from everything required for the current page
      {
        test: /\.s?[a|c]ss$/,
        use: isProd ? extractSass.extract({
          use: [{
            loader: 'sass-loader'
          }],
          fallback: 'style-loader'
        }) : 'sass-loader'
      },
      // Transpile ES6/7 into older versions for better browser support
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          path.resolve(cubic.config.ui.sourcePath),
          path.resolve(__dirname, '../../vue')
        ]
      }
    ]
  },

  // Change how modules are resolved. (Places to look in, alias, etc)
  resolve: {
    // Resolve dependencies differently when in debug due to source code folder
    // being different from current working directory
    alias: Object.assign({
      src: cubic.config.ui.sourcePath,
      public: cubic.config.ui.core.publicPath
    }, isDebug ? {
      // HMR will trigger a second vue instance without this
      vue: `${__dirname}/../../node_modules/vue`
    } : {})
  },

  // Plugins for post-bundle operations
  plugins: (isProd ? [
    new webpack.EnvironmentPlugin('NODE_ENV')
  ] : [])
    .concat([
      extractSass,
      new TimeFixPlugin(),
      new webpack.DefinePlugin({
        '$apiUrl': JSON.stringify(cubic.config.ui.client.apiUrl),
        '$authUrl': JSON.stringify(cubic.config.ui.client.authUrl)
      })
    ])
}
