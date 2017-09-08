const extend = require('deep-extend')
const local = require('./config/local.js')

module.exports = function(config) {
  config = extend(local, config)
  const Blitz = require('blitz-js-loader')(config.blitz)
  const intro = require('./logger.js')

  /**
   * Authentication node user management and token generation
   */
  if (!config.auth.disable) {
    const Auth = require('blitz-js-auth')
    config.auth.hooks.forEach(hook => {
      blitz.hook('auth_core', hook)
    })
    blitz.use(new Auth(config.auth))
  }

  /**
   * API node to distribute incoming requests to core nodes
   */
   if (!config.api.disable) {
     const Api = require('blitz-js-api')
     config.api.hooks.forEach(hook => {
       blitz.hook(Api, hook)
     })
     blitz.use(new Api(config.api))
   }

   /**
    * Core node which handles the actual processing of requests
    */
    if (!config.core.disable) {
      const Core = require('blitz-js-core')
      config.core.hooks.forEach(hook => {
        blitz.hook(Core, hook)
      })
      blitz.use(new Core(config.core))
    }

   /**
    * View node which renders visual webpages
    */
    if (!config.view.disable) {
      const View = require('blitz-js-view')
      config.view.hooks.forEach(hook => {
        blitz.hook('view_core', hook)
      })
      blitz.use(new View(config.view))
    }
}
