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
     * Middleware Options
     */
    useRequestLogger: true,
    useRateLimiter: true,


    /**
     * Databases
     */
    mongoPort: 27017,
    mongoURL: "mongodb://localhost/blitz",
    redisPort: 6379,


    /**
     * Cache settings
     */
    cacheDB: 1,
    cacheExp: 1800,


    /**
     * Authorization properties
     */
    authCert: fs.readFileSync(__dirname + "/certs/auth_public.pem", "utf-8"),


    /**
     * Cluster config
     */
    cores: os.cpus().length
}
