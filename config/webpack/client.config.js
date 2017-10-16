const isProd = blitz.config.local.environment !== "development"
const webpack = require("webpack")
const merge = require("webpack-merge")
const baseConfig = require("./base.config.js")
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin")
const MinifyCssPlugin = require('optimize-css-assets-webpack-plugin')
const MinifyJsPlugin = require('uglifyjs-webpack-plugin')

/**
 * Config is merged with base config which contains common configuration
 * for both server and client bundles
 */
module.exports = merge(baseConfig, {
  name: "client",

  // Entry point which guides to everything webpack is supposed to bundle
  // Use app so hot-module-reload can overwrite entry for that specific part
  entry: {
    client: __dirname + "/../../vue/app-client.js"
  },

  plugins: [
    // Important: this splits the webpack runtime into a leading chunk
    // so that async chunks can be injected right after it.
    // this also enables better caching for your app/vendor code.
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: function (module) {
        // a module is extracted into the vendor chunk if...
        return (
          // it's inside node_modules
          /node_modules/.test(module.context) &&
          // and not a CSS file (due to extract-text-webpack-plugin limitation)
          !/\.css$/.test(module.request)
        )
      }
    }),
    // extract webpack runtime & manifest to avoid vendor chunk hash changing
    // on every build.
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),
    // This plugins generates `vue-ssr-client-manifest.json` in the
    // output directory.
    new VueSSRClientPlugin()
  ].concat(isProd ? [
    new MinifyCssPlugin(),
    new MinifyJsPlugin()
  ] : [])
})
