const fs = require('fs')
const os = require('os')

module.exports = {

    /**
     * Current Node Information
     */
    port: 3030,
    routes: __dirname + "/endpoints/routes.js",
    maxLogsPerUser: 20,


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
    mongoURL: "mongodb://localhost/blitz",


    /**
     * Authorization properties
     */
    cert: fs.readFileSync(__dirname + "/certs/auth_private.pem", "utf-8"),
    scopes: require("./scopes/scopes.js"),


    /**
     * Cluster config
     */
    cores: os.cpus().length
}
