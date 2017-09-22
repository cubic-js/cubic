const os = require('os')

module.exports = {
  api: {
    port: 3030,

    /**
     * Databases
     */
    cacheDB: 3,
    mongoURL: 'mongodb://localhost/blitz-js-auth',

    /**
     * Blitz information
     */
    id: 'auth_api',
    cores: Math.ceil(os.cpus().length / 2)
  },

  core: {
    /**
     * token config
     */
    iss: 'http://localhost:3030',
    exp: '1h',
    alg: 'RS256',

    /**
     * Databases
     */
    mongoPort: 27017,
    mongoURL: 'mongodb://localhost/blitz-js-auth',

    /**
     * Target Node URLs
     */
    apiURL: 'http://localhost:3030',
    authURL: 'http://localhost:3030',

    /**
     * Logic-specific
     */
    endpointPath: __dirname + '/../endpoints/',
    maxLogsPerUser: 50, // Max number of ip logs for authentication
    id: 'auth_core',
    cores: Math.ceil(os.cpus().length / 2)
  },

  /**
   * User maintenance information
   */
  purgeInterval: 3600000, // Interval to check for inactive users (in ms)
  purgeMaxLimit: 2592000000, // Age at which user is considered inactive (in ms)
  // Production only. Set to 0 to disable pruge.

  /**
   * Cluster config
   */
  master: true,
}
