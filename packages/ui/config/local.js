module.exports = {
  api: {
    port: 3000,
    cacheExp: 10,

    /**
     * cubic information
     */
    group: 'ui'
  },

  core: {
    /**
     * Databases
     */
    mongoUrl: 'mongodb://localhost/',
    mongoDb: 'cubic-ui',
    cacheDb: 2,

    /**
     * Endpoint config
     */
    endpointPath: `${process.cwd()}/ui/endpoints`,
    endpointParent: `${__dirname}/../override/endpoint.js`,

    /**
     * Target Node URLs
     */
    apiUrl: 'ws://localhost:3000/ws',
    authUrl: 'ws://localhost:3030/ws',

    /**
     * cubic information
     */
    group: 'ui'
  },

  /**
   * Web client config
   */
  client: {
    apiUrl: 'ws://localhost:3003/ws',
    authUrl: 'ws://localhost:3030/ws',
    sessionKey: 'cubic-ui-session'
  },

  /**
   * Webpack config
   */
  webpack: {
    skipBuild: false,
    clientConfig: `${process.cwd()}/config/webpack/client.config.js`,
    serverConfig: `${process.cwd()}/config/webpack/server.config.js`
  },

  sourcePath: `${process.cwd()}/ui`,
  sitesPath: `${process.cwd()}/ui/sites`
}
