const os = require('os')

module.exports = {
  api: {
    port: 3030,

    /**
     * Databases
     */
    cacheDb: 3,

    /**
     * Blitz information
     */
    id: 'auth_api',
    cores: Math.ceil(os.cpus().length / 2)
  },

  core: {
    /**
     * Databases
     */
    mongoUrl: 'mongodb://localhost/blitz-js-auth',

    /**
     * Target Node URLs
     */
    apiUrl: 'http://localhost:3030',
    authUrl: 'http://localhost:3030',

    /**
     * Logic-specific
     */
    endpointPath: __dirname + '/../endpoints/',
    id: 'auth_core',
    cores: Math.ceil(os.cpus().length / 2)
  },

  /**
   * Token config
   */
  iss: 'http://localhost:3030',
  exp: '1h',
  alg: 'RS256',

  /**
   * User maintenance information
   */
  purgeInterval: 3600000, // Interval to check for inactive users (in ms)
  purgeMaxLimit: 2592000000, // Age at which user is considered inactive (in ms)
  maxLogsPerUser: 50, // Max number of ip logs for authentication
  // Production only. Set to 0 to disable pruge.

  /**
   * Cluster config
   */
  master: true,
}
