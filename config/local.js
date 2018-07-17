module.exports = {
  api: {
    port: 3000,
    routes: `${__dirname}/endpoints/routes.js`,
    events: `${__dirname}/endpoints/events.js`,
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
    apiUrl: 'http://localhost:3000',
    authUrl: 'http://localhost:3030',

    /**
     * cubic information
     */
    group: 'ui'
  },

  /**
   * Web client config
   */
  client: {
    apiUrl: 'http://localhost:3003',
    authUrl: 'http://localhost:3030',
    accessTokenCookie: 'cubic-ui-cookie-access-token'
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
