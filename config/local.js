const os = require('os')

module.exports = {
  api: {
    port: 3020,
    routes: __dirname + "/endpoints/routes.js",
    events: __dirname + "/endpoints/events.js",
    cacheExp: 10,
    id: 'view_api'
  },

  core: {
    /**
     * Databases
     */
    mongoPort: 27017,
    mongoURL: "mongodb://localhost/blitz-js-view",
    cacheDB: 2,

    /**
     * Endpoint config
     */
    endpointPath: __dirname + "/../vue/endpoints",
    endpointParent: __dirname + "/../override/endpoint.js",
    sourcePath: __dirname + "/../view",
    publicPath: __dirname + "/../assets",

    /**
     * Target Node URLs
     */
    apiURL: "http://localhost:3020",
    authURL: "http://localhost:3030",

    id: 'view_core'
  },

  /**
   * Web client config
   */
  client: {
    api: 'http://localhost:3010',
    auth: 'http://localhost:3030',
    user_key: null,
    user_secret: null
  },

  /**
   * Webpack config
   */
  webpack: {
    clientConfig: __dirname + "/webpack/client.config.js",
    serverConfig: __dirname + "/webpack/server.config.js"
  },

  /**
   * Cluster config
   */
  cores: Math.ceil(os.cpus().length / 2),
  master: true,
  id: 'view'
}
