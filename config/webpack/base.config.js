const fs = require('fs')
const isProd = blitz.config.local.environment !== "development"
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const extractSass = new ExtractTextPlugin({
  filename: "[name].[chunkhash].css",
  disable: !isProd
})

// Dependencies need to be handled differently in debug (see alias)
let isDebug = false
try {
  fs.statSync(__dirname + '/../../../../node_modules')
} catch(err) {
  isDebug = true
}

// Actual config
module.exports = {
  context: __dirname + "/../../",

  // Output file which will be loaded by Vue (server & client side)
  output: {
    path: blitz.config[blitz.id].publicPath,
    publicPath: "/",
    filename: isProd ? "[name].bundle.[hash].js" : "[name].bundle.js"
  },

  // Loaders which determine how file types are interpreted
  module: {
    rules: [{
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          extractCSS: isProd ? true : false,
          loaders: isProd ? {
            scss: extractSass.extract({
              use: "!css-loader!sass-loader?"
            })
          } : {}
        }
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.s?[a|c]ss$/,
        use: isProd ? extractSass.extract({
          use: [{
            loader: "sass-loader"
          }],
          fallback: "style-loader"
        }) : "sass-loader"
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          "file-loader?hash=sha512&digest=hex&name=[hash].[ext]",
          {
            loader: 'image-webpack-loader',
            query: {
              mozjpeg: {
                progressive: true,
                quality: 100
              },
              gifsicle: {
                interlaced: false
              },
              optipng: {
                optimizationLevel: 4
              },
              pngquant: {
                quality: 50-70,
                speed: 3
              }
            }
          }
        ]
      }
    ]
  },

  // Change how modules are resolved. (Places to look in, alias, etc)
  resolve: {
    // Resolve dependencies differently when in debug due to source code folder
    // being different from current working directory
    alias: Object.assign({
      src: blitz.config[blitz.id].sourcePath,
      public: blitz.config[blitz.id].publicPath,
    }, isDebug ? {
      // HMR will trigger a second vue instance without this
      vue: __dirname + "/../../node_modules/vue"
    } : {})
  },

  // Plugins for post-bundle operations
  plugins: [
    extractSass
  ]
}
