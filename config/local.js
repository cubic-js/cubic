const fs = require('fs')
const os = require('os')

module.exports = {

    /**
     * Current Node Information
     */
    port: 3010,
    routes: __dirname + "/endpoints/routes.js",
    events: __dirname + "/endpoints/events.js",


    /**
     * Core Node Config
     */
    requestTimeout: 1000,


    /**
     * Middleware Options
     */
    useRequestLogger: true,
    useRateLimiter: true,


    /**
     * Databases
     */
    mongoPort: 27017,
    mongoURL: "mongodb://localhost/blitz-js-api",
    redisPort: 6379,


    /**
     * Cache settings
     */
    cacheDB: 1,
    cacheExp: 1800,


    /**
     * Authorization properties
     */
    certPublic: fs.readFileSync(__dirname + "/certs/auth_public.pem", "utf-8"),


    /**
     * Cluster config
     */
    cores: os.cpus().length
}
