const path = require("path")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const isProd = blitz.config.local.environment !== "development"
const extractSass = new ExtractTextPlugin({
    filename: "[name].[chunkhash].css",
    disable: !isProd
})

module.exports = {
    // Output file which will be loaded by Vue (server & client side)
    output: {
        path: blitz.config[blitz.id].publicPath,
        filename: "[name].bundle.js"
    },

    // Loaders which determine how file types are interpreted
    module: {
        rules: [{
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    extractCSS: isProd ?  true : false,
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
                use: extractSass.extract({
                    use: [{
                        loader: "sass-loader"
                    }],
                    fallback: "style-loader"
                })
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    "file-loader?hash=sha512&digest=hex&name=[hash].[ext]",
                    "image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false"
                ]
            }
        ]
    },

    // Change how modules are resolved. (Places to look in, alias, etc)
    resolve: {
        alias: {
            src: blitz.config[blitz.id].sourcePath
        }
    },

    // Plugins for post-bundle operations
    plugins: [
        extractSass
    ]
}
