module.exports = {

  /**
   * Current Node Information
   */
  port: 3003,
  routes: __dirname + '/../connections/entry/routes.js',
  events: __dirname + '/../connections/entry/events.js',

  /**
   * Core Node Config
   */
  requestTimeout: 1000,

  /**
   * Databases
   */
  redisUrl: 'redis://localhost',

  /**
   * Cache settings
   */
  cacheDb: 1,
  cacheExp: 10,
}
