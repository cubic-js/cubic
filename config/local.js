const os = require('os')

module.exports = {
  api: {
    port: 3020,
    routes: __dirname + "/endpoints/routes.js",
    events: __dirname + "/endpoints/events.js",
    limiter: {
      high: {
        interval: 180000,
        maxInInterval: 360
      }
    },
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
    endpointPath: __dirname + "/../endpoints/",
    endpointParent: __dirname + "/../endpoint.js",
    sourcePath: __dirname + "/../view/lib/src",
    publicPath: __dirname + "/../view/lib/public",

    /**
     * Target Node URLs
     */
    apiURL: "http://localhost:3020",
    authURL: "http://localhost:3030",

    id: 'view_core'
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
