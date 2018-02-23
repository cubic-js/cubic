module.exports = {

  /**
   * Core-Node config
   */
  publicPath:`${process.cwd()}/assets`,
  endpointPath: `${process.cwd()}/api`,
  endpointParent: __dirname + '/../lib/endpoint.js',
  baseUrl: '',

  /**
   * Target Node URLs
   */
  apiUrl: 'http://localhost:3001',
  authUrl: 'http://localhost:3030',
  userKey: undefined,
  userSecret: undefined,

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
  mongoDb: 'blitz-js-core',
  redisUrl: 'redis://localhost',
}
