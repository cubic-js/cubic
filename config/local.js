const os = require('os')

module.exports = {
  api: {
    port: 3020,
    routes: __dirname + '/endpoints/routes.js',
    events: __dirname + '/endpoints/events.js',
    cacheExp: 10,
    id: 'view_api'
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
    endpointPath: __dirname + '/../vue/endpoints',
    endpointParent: __dirname + '/../override/endpoint.js',
    sourcePath: __dirname + '/../view',
    publicPath: __dirname + '/../assets',

    /**
     * Target Node URLs
     */
    apiUrl: 'http://localhost:3020',
    authUrl: 'http://localhost:3030',

    id: 'view_core'
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
    clientConfig: __dirname + '/webpack/client.config.js',
    serverConfig: __dirname + '/webpack/server.config.js'
  },

  /**
   * View related settings
   */
  skipWebpackBuild: false,

  /**
   * Cluster config
   */
  cores: Math.ceil(os.cpus().length / 2),
  master: true,
  id: 'view'
}
