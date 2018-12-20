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
    endpointPath: `${process.cwd()}/ui`,
    endpointPathExclude: /^((?!(\/endpoints|\/sites)).)*$/g,
    endpointDepth: 1,
    endpointExtension: /(\.js|\.vue)$/,
    endpointParent: `${__dirname}/../endpoint.js`
  },

  /**
   * Web client config
   */
  client: {
    apiUrl: 'ws://localhost:3003/ws',
    authUrl: 'ws://localhost:3030/ws',
    sessionKey: 'cubic-ui-session'
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
