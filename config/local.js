const fs = require('fs')
const os = require('os')

module.exports = {

    /**
     * Core-Node config
     */
    endpointPath:  __dirname + "/../methods/",


    /**
     * Target Node URLs
     */
     apiURL: "http://localhost:3010",
     authURL: "http://localhost:3030",


    /**
     * Databases
     */
    mongoPort: 27017,
    mongoURL: "mongodb://localhost/blitz",
    redisPort: 6379,


    /**
     * Authentication Credentials
     */
    user_key: "Vf9W14UqTOceb6p6hTarH9LCbJCIKpY1PLUFHFj68cpWnLM91S2pzELKUc8bGn9I",
    user_secret: "wSIKrCEldMIeKi7W6Q0ITHSAudnzXWYUEAEFe1HmZEbPcyjnW4VNjjuwxpmAB05C",


    /**
     * Cluster config
     */
    cores: os.cpus().length
}
