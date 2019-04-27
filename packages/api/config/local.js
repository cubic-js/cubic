module.exports = {

  /**
   * Current Node Information
   */
  port: 3003,

  /**
   * Endpoint Config
   */
  publicPath: `${process.cwd()}/assets`,
  endpointPath: `${process.cwd()}/api`,
  endpointPathExclude: /a^/, // exclude nothing by default
  endpointDepth: 0,
  endpointExtension: /\.js$/,
  endpointParent: `${__dirname}/../endpoint.js`,
  baseUrl: '',

  /**
   * Rate limit global settings (when not overriden in endpoint)
   */
  limit: {
    disable: false,
    interval: 5000,
    maxInInterval: 20
  },

  /**
   * Databases
   */
  mongoUrl: 'mongodb://localhost/',
  mongoDb: 'cubic-core',
  redisUrl: 'redis://localhost',

  /**
   * Cache settings
   */
  cacheDb: 1,
  cacheExp: 60,

  /**
   * Cookie Authorization settings
   */
  authCookie: 'cubic-auth-cookie',
  authCookieExpire: 30, // in days
  apiUrl: 'ws://localhost:3003/ws',
  authUrl: 'ws://localhost:3030/ws',
  userKey: undefined,
  userSecret: undefined
}
