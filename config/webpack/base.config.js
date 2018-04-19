const isProd = cubic.config.local.environment !== 'development'
const webpack = require('webpack')
const fs = require('fs')
const path = require('path')
const MiniCss = require('mini-css-extract-plugin')
const miniCss = new MiniCss({
  filename: 'client-[contenthash].css',
  chunkFilename: 'client-[name].[contenthash].css',
  disable: !isProd
})
const vueConfig = require('./vue.config.js')(MiniCss)

// Dependencies need to be handled differently in debug (see webpack resolve)
let isDebug = false
try {
  fs.statSync(`${__dirname}/../../../../node_modules`)
} catch (err) {
  isDebug = true
}

// Actual config
module.exports = {
  mode: isProd ? 'production' : 'development',

  // Output file which will be loaded by Vue (server & client side)
  output: {
    path: cubic.config.ui.core.publicPath,
    filename: isProd ? 'client-[name].[chunkhash].js' : 'dev-[name].bundle.js'
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
      // SCSS compiler with Mini Css to generate one css file
      // from everything required for the current page
      {
        test: /\.s?[a|c]ss$/,
        use: isProd ? [
          MiniCss.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoader: 2
            }
          }, 'sass-loader'
        ] : 'sass-loader'
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
      miniCss,
      new webpack.DefinePlugin({
        '$apiUrl': JSON.stringify(cubic.config.ui.client.apiUrl),
        '$authUrl': JSON.stringify(cubic.config.ui.client.authUrl)
      })
    ])
}
