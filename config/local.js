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
    group: 'auth'
  },

  core: {
    /**
     * Databases
     */
    mongoUrl: 'mongodb://localhost/',
    mongoDb: 'blitz-js-auth',

    /**
     * Target Node URLs
     */
    apiUrl: 'http://localhost:3030',
    authUrl: 'http://localhost:3030',

    /**
     * Logic-specific
     */
    endpointPath: __dirname + '/../endpoints/',

    /**
     * Blitz information
     */
    group: 'auth'
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
}
