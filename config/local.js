module.exports = {
  api: {
    port: 3030,

    /**
     * Databases
     */
    cacheDb: 3,

    /**
     * cubic information
     */
    group: 'auth'
  },

  core: {
    /**
     * Databases
     */
    mongoUrl: 'mongodb://localhost/',
    mongoDb: 'cubic-auth',

    /**
     * Target Node URLs
     */
    apiUrl: 'ws://localhost:3030/ws',
    authUrl: 'ws://localhost:3030/ws',

    /**
     * Logic-specific
     */
    endpointPath: `${__dirname}/../endpoints/`,

    /**
     * cubic information
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
  maxLogsPerUser: 50 // Max number of ip logs for authentication
}
