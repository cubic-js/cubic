module.exports = {

  /**
   * Current Node Information
   */
  port: 3003,
  routes: `${__dirname}/../connections/entry/routes.js`,
  events: `${__dirname}/../connections/entry/events.js`,

  /**
   * Core Node Config
   */
  requestTimeout: 1000,

  /**
   * Databases
   */
  redisUrl: 'redis://localhost',

  /**
   * Rate limit settings. 10 requests per second => deny
   */
  limit: {
    interval: 5000,
    maxInInterval: 50
  },

  /**
   * Cache settings
   */
  cacheDb: 1,
  cacheExp: 10
}
