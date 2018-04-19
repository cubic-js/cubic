module.exports = {
  postLoaders: {
    css: require('autoprefixer')({
      browsers: ['last 3 versions']
    })
  }
}
