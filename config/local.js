const os = require('os')

module.exports = {

    /**
     * Core-Node config
     */
    endpointPath:  __dirname + "/../endpoints/",
    endpointParent: __dirname +"/../Endpoint.js",


    /**
     * Target Node URLs
     */
     apiURL: "http://localhost:3010",
     authURL: "http://localhost:3030",


    /**
     * Databases
     */
    mongoPort: 27017,
    mongoURL: "mongodb://localhost/blitz-js-core",
    redisPort: 6379,


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
