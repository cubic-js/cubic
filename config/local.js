const os = require('os')

module.exports = {

    /**
     * Current Node Information
     */
    port: 3020,
    routes: __dirname + "/endpoints/routes.js",
    events: __dirname + "/endpoints/events.js",
    isCore: true,
    isApi: true,


    /**
     * Core-Node config
     */
    cacheDuration: 10,
    sourcePath: __dirname +"/../view/src",
    publicPath: __dirname + "/../view/public",
    endpointPath: __dirname + "/../view/endpoints/",
    endpointParent: __dirname + "/../Endpoint.js",


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
    cores: os.cpus().length
}
