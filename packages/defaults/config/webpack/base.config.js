const isProd = cubic.config.local.environment !== 'development'
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  mode: isProd ? 'production' : 'development',

  // Output file which will be loaded by Vue (server & client side)
  output: {
    path: `${cubic.config.ui.api.publicPath}/bundles`,
    filename: isProd ? 'bundle.[name].[contenthash].js' : 'dev-[name].bundle.js'
  },

  // Loaders which determine how file types are interpreted
  module: {
    rules: [
      // This is our main loader for vue files
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },

  // Change how modules are resolved. (Places to look in, alias, etc)
  resolve: {
    alias: {
      src: cubic.config.ui.sourcePath,
      public: cubic.config.ui.api.publicPath
    }
  },

  // Plugins for post-bundle operations
  plugins: (isProd ? [
    new webpack.EnvironmentPlugin('NODE_ENV')
  ] : []).concat([
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      '$apiUrl': JSON.stringify(cubic.config.ui.client.apiUrl),
      '$authUrl': JSON.stringify(cubic.config.ui.client.authUrl)
    })
  ])
}
