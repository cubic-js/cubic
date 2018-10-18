module.exports = {

  /**
   * Core-Node config
   */
  publicPath: `${process.cwd()}/assets`,
  endpointPath: `${process.cwd()}/api`,
  endpointPathExclude: /a^/, // exclude nothing by default
  endpointParent: `${__dirname}/../lib/endpoint.js`,
  baseUrl: '',
  maxPending: 500, // How many requests can handled at once before returning 503

  /**
   * Target Node URLs
   */
  apiUrl: 'ws://localhost:3003/ws',
  authUrl: 'ws://localhost:3030/ws',
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
