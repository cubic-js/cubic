const isProd = cubic.config.local.environment !== 'development'
const merge = require('webpack-merge')
const baseConfig = require('./base.config.js')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const MinifyCssPlugin = require('optimize-css-assets-webpack-plugin')
const MinifyJsPlugin = require('uglifyjs-webpack-plugin')

/**
 * Config is merged with base config which contains common configuration
 * for both server and client bundles
 */
module.exports = merge(baseConfig, {
  name: 'client',

  // Entry point which guides to everything webpack is supposed to bundle
  // Use app so hot-module-reload can overwrite entry for that specific part
  entry: {
    client: `${__dirname}/../../vue/app-client.js`
  },

  plugins: [
    // This plugins generates `vue-ssr-client-manifest.json` in the
    // output directory.
    new VueSSRClientPlugin()
  ].concat(isProd ? [
    new MinifyCssPlugin(),
    new MinifyJsPlugin({
      cache: true,
      parallel: true
    })
  ] : [])
})
