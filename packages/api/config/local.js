module.exports = {

  /**
   * Current Node Information
   */
  port: 3003,

  /**
   * Core Node Config
   */
  publicPath: `${process.cwd()}/assets`,

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
  cacheExp: 60,

  /**
   * Authorization settings.
   */
  authCookie: 'cubic-auth-cookie',
  authCookieExpire: 30, // in days
  authUrl: 'ws://localhost:3030/ws',
  userKey: undefined,
  userSecret: undefined
}
