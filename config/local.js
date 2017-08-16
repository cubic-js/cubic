const fs = require('fs')
const os = require('os')
const prvCert = fs.readFileSync(__dirname + "/certs/auth_private.pem", "utf-8")
const pubCert = fs.readFileSync(__dirname + "/certs/auth_public.pem", "utf-8")

module.exports = {

    /**
     * Current Node Information
     */
    port: 3030,
    endpointPath: __dirname + "/../endpoints/",


    /**
     * User maintenance information
     */
    maxLogsPerUser: 50, // Max number of ip logs for authentication
    purgeInterval: 3600000, // Interval to check for inactive users (in ms)
    purgeMaxLimit: 2592000000, // Age at which user is considered inactive (in ms)
                               // Production only. Set to 0 to disable pruge.


    /**
     * token config
     */
    iss: "http://localhost:3030",
    exp: "1h",
    alg: "RS256",


    /**
     * Databases
     */
    mongoPort: 27017,
    mongoURL: "mongodb://localhost/blitz-js-auth",
    cacheDB: 3,


    /**
     * Authorization properties
     */
    certPrivate: prvCert,
    certPublic: pubCert,
    scopes: require("./scopes/scopes.js"),


    /**
     * Target Node URLs
     */
     apiURL: "http://localhost:3030",
     authURL: "http://localhost:3030",


    /**
     * Authentication Credentials for core-node
     */
    user_key: "dev",
    user_secret: "dev",


    /**
     * Cluster config
     */
    cores: os.cpus().length
}
