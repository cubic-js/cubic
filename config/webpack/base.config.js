const path = require("path")
const modules = `${__dirname}/../../node_modules`
const ExtractTextPlugin = require("extract-text-webpack-plugin")

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
                loader: `${modules}/vue-loader`,
                options: {
                    extractCSS: true
                }
            },
            {
                test: /\.js$/,
                loader: `${modules}/babel-loader`,
                exclude: /node_modules/
            },
            {
                test: /\.s?[a|c]ss$/,
                use: [
                {
                    loader: `!${modules}/vue-style-loader!${modules}/sass-loader`,
                    options: {
                        includePaths: [blitz.config[blitz.id].sourcePath]
                    }
                }]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    `${modules}/file-loader?hash=sha512&digest=hex&name=[hash].[ext]`,
                    `${modules}/image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false`
                ]
            }
        ]
    },

    // Make source path accessible inside components, e.g. import 'src/app.vue'
    resolve: {
        alias: {
            src: blitz.config[blitz.id].sourcePath
        }
    },

    // Plugins for post-bundle operations
    plugins: [
        new ExtractTextPlugin({
            filename: "[name].[chunkhash].css",
            disable: blitz.config.local.environment === "development"
        })
    ]
}
