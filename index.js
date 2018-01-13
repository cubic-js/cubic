const extend = require('deep-extend')
const local = require('./config/local.js')

module.exports = function(config) {
  config = extend(local, config)
  const Blitz = require('blitz-js-loader')(config.blitz)
  const intro = require('./logger.js')
  const Auth = require('blitz-js-auth')
  const Api = require('blitz-js-api')
  const Core = require('blitz-js-core')
  const View = require('blitz-js-view')

  /**
   * Authentication node user management and token generation
   */
  config.auth.hooks.forEach(hook => blitz.hook('auth_core', hook))
  blitz.use(new Auth(config.auth))

  /**
   * API node to distribute incoming requests to core nodes
   */
  config.api.hooks.forEach(hook => blitz.hook(config.api.id || Api, hook))
  blitz.use(new Api(config.api))

  /**
   * Core node which handles the actual processing of requests
   */
  config.core.hooks.forEach(hook => blitz.hook(config.core.id || Core, hook))
  blitz.use(new Core(config.core))

  /**
   * View node which renders visual webpages
   */
  config.view.hooks.forEach(hook => blitz.hook('view_core', hook))
  blitz.use(new View(config.view))
}
