const os = require('os')

module.exports = {

  /**
   * Current Node Information
   */
  port: 3010,
  routes: __dirname + '/endpoints/routes.js',
  events: __dirname + '/endpoints/events.js',

  /**
   * Core Node Config
   */
  requestTimeout: 1000,

  /**
   * Middleware Options
   */
  useRequestLogger: true,

  /**
   * Databases
   */
  redisUrl: 'redis://localhost'

  /**
   * Cache settings
   */
  cacheDb: 1,
  cacheExp: 10,

  /**
   * Cluster config
   */
  cores: os.cpus().length
}
