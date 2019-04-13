module.exports = {
  api: {
    port: 3000,
    cacheExp: 60,
    group: 'ui',

    /**
     * Databases
     */
    mongoUrl: 'mongodb://localhost/',
    mongoDb: 'cubic-ui',
    cacheDb: 2,

    /**
     * Endpoint config
     */
    endpointPath: [`${process.cwd()}/ui/endpoints`, `${process.cwd()}/ui/sites`],
    endpointExtension: /(\.js|\.vue)$/,
    endpointParent: `${__dirname}/../endpoint.js`,

    /**
     * Cookie/Auth
     */
    authCookie: 'cubic-auth-cookie',
    authCookieExpire: 30 // in days
  },

  /**
   * Web client config
   */
  client: {
    apiUrl: 'ws://localhost:3003/ws',
    authUrl: 'ws://localhost:3030/ws'
  },

  /**
   * SSR client config
   */
  server: {
    apiUrl: 'ws://localhost:3003/ws',
    authUrl: 'ws://localhost:3030/ws'
  },

  /**
   * Webpack config
   */
  webpack: {
    skipBuild: false,
    clientConfig: `${process.cwd()}/config/webpack/client.config.js`,
    serverConfig: `${process.cwd()}/config/webpack/server.config.js`
  },

  sourcePath: `${process.cwd()}/ui`
}
