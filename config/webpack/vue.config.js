const isProd = cubic.config.local.environment !== 'development'

module.exports = (extractSass) => {
  return {
    extractCSS: isProd,
    preserveWhitespace: false,
    loaders: isProd ? {
      scss: extractSass.extract({
        use: '!css-loader!sass-loader?'
      })
    } : {},
    postLoaders: {
      css: require('autoprefixer')({
        browsers: ['last 3 versions']
      })
    }
  }
}
