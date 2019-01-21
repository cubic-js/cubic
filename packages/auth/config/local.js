module.exports = {
  api: {
    port: 3030,
    endpointPath: `${__dirname}/../endpoints/`,
    group: 'auth',

    /**
     * Databases
     */
    cacheDb: 3,
    mongoUrl: 'mongodb://localhost/',
    mongoDb: 'cubic-auth'
  },

  skipInitialSetup: false,
  certPublicPath: `${process.cwd()}/config/auth.public.pem`,
  certPrivatePath: `${process.cwd()}/config/certs/auth.private.pem`,

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
