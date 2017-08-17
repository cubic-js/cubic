const path = require("path")
const modules = `${__dirname}/../../node_modules`

module.exports = {
    // Output file which will be loaded by [???]
    output: {
        path: blitz.config[blitz.id].publicPath,
        filename: "[name].bundle.js"
    },

    // Loaders which determine how file types are interpreted
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: `${modules}/vue-loader`
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
    }
}
