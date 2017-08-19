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
        rules: [
            {
                test: /\.vue$/,
                loader: `${modules}/vue-loader`,
                options: {
                    extractCSS: true
                }
            },
            {
                test:/\.js$/,
                loader: `${modules}/babel-loader`,
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loader: `${modules}/vue-style-loader`
            }
        ]
    },

    // Plugins for post-bundle operations
    plugins: [
        new ExtractTextPlugin({filename: "common.[chunkhash].css"})
    ]
}
