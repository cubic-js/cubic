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
  limiter: {
    enabled: true,
    low: {
      interval: 5000,
      maxInInterval: 50
    },
    mid: {
      interval: 10000,
      maxInInterval: 30
    },
    high: {
      interval: 10000,
      maxInInterval: 20
    }
  },

  /**
   * Databases
   */
  mongoPort: 27017,
  mongoURL: 'mongodb://localhost/blitz-js-api',
  redisPort: 6379,

  /**
   * Cache settings
   */
  cacheDB: 1,
  cacheExp: 10,

  /**
   * Cluster config
   */
  cores: os.cpus().length
}
