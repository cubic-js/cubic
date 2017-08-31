const os = require('os')

module.exports = {

  /**
   * Current Node Information
   */
  isCore: true,
  isApi: true,

  /**
   * Webpack config
   */
  webpack: {
    clientConfig: __dirname + "/webpack/client.config.js",
    serverConfig: __dirname + "/webpack/server.config.js"
  },

  /**
   * API node config
   */
  port: 3020,
  routes: __dirname + "/endpoints/routes.js",
  events: __dirname + "/endpoints/events.js",
  limiter: {
    high: {
      interval: 60000,
      maxInInterval: 120
    }
  },

  /**
   * Core-Node config
   */
  cacheDuration: 10,
  sourcePath: __dirname + "/../view/lib/src",
  publicPath: __dirname + "/../view/lib/public",
  endpointPath: __dirname + "/../endpoints/",
  endpointParent: __dirname + "/../endpoint.js",

  /**
   * Target Node URLs
   */
  apiURL: "http://localhost:3020",
  authURL: "http://localhost:3030",

  /**
   * Databases
   */
  mongoPort: 27017,
  mongoURL: "mongodb://localhost/blitz-js-view",
  cacheDB: 2,

  /**
   * Authentication Credentials
   */
  user_key: "dev",
  user_secret: "dev",

  /**
   * Cluster config
   */
  cores: Math.ceil(os.cpus().length / 2)
}
