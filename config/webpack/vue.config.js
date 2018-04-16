const isProd = cubic.config.local.environment !== 'development'

module.exports = (MiniCss) => {
  return {
    extractCSS: isProd,
    preserveWhitespace: false,
    loaders: isProd ? {
      scss: [MiniCss.loader, {
        loader: 'css-loader',
        options: {
          modules: true,
          sourceMap: true,
          importLoader: 2
        }
      }, 'sass-loader']
    } : {},
    postLoaders: {
      css: require('autoprefixer')({
        browsers: ['last 3 versions']
      })
    }
  }
}
