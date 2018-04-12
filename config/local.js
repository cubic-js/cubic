module.exports = {

  /**
   * Core-Node config
   */
  publicPath: `${process.cwd()}/assets`,
  endpointPath: `${process.cwd()}/api`,
  endpointPathExclude: /a^/, // exclude nothing by default
  endpointParent: `${__dirname}/../lib/endpoint.js`,
  baseUrl: '',

  /**
   * Target Node URLs
   */
  apiUrl: 'http://localhost:3003',
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
  mongoDb: 'cubic-core',
  redisUrl: 'redis://localhost'
}
