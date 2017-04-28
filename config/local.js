const fs = require('fs')
const os = require('os')

module.exports = {

    /**
     * Current Node Information
     */
    port: 3010,
    routes: require("./endpoints/routes.js"),
    events: require("./endpoints/events.js"),


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
     * Authorization properties
     */
    authCert: fs.readFileSync(__dirname + "/certs/auth_public.pem", "utf-8"),
    authScopes: require("./auth/scopes.js"),


    /**
     * Cluster config
     */
    cores: os.cpus().length
}
