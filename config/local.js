module.exports = {
  api: {
    port: 3020,
    routes: __dirname + '/endpoints/routes.js',
    events: __dirname + '/endpoints/events.js',
    cacheExp: 10,

    /**
     * Blitz information
     */
    group: 'view'
  },

  core: {
    /**
     * Databases
     */
    mongoUrl: 'mongodb://localhost/',
    mongoDb: 'blitz-js-view',
    cacheDb: 2,

    /**
     * Endpoint config
     */
    endpointPath: `${process.cwd()}/view/endpoints`,
    endpointParent: __dirname + '/../override/endpoint.js',

    /**
     * Target Node URLs
     */
    apiUrl: 'http://localhost:3020',
    authUrl: 'http://localhost:3030',

    /**
     * Blitz information
     */
    group: 'view'
  },

  /**
   * Web client config
   */
  client: {
    apiUrl: 'http://localhost:3010',
    authUrl: 'http://localhost:3030',
    userKey: null,
    userSecret: null
  },

  /**
   * Webpack config
   */
  webpack: {
    skipBuild: false,
    clientConfig: __dirname + '/webpack/client.config.js',
    serverConfig: __dirname + '/webpack/server.config.js'
  },
  sourcePath: `${process.cwd()}/view`,
  sitesPath: `${process.cwd()}/view/sites`
}
