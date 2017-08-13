/**
 * Dependencies
 */
const BlitzQuery = require("blitz-js-query")
const EndpointController = require("./endpoints.js")
const CircularJSON = require("circular-json")


/**
 * Connects to local API Node & handles basic cycles
 */
class Client {

    /**
     * Connect to blitz.js API node
     */
    constructor() {

        // blitz-js-query options
        let options = {

            // Connection Settings
            api_url: blitz.config[blitz.id].apiURL,
            auth_url: blitz.config[blitz.id].authURL,
            use_socket: true,
            namespace: "/root",
            ignore_limiter: true,

            // Authentication Settings
            user_key: blitz.config[blitz.id].user_key,
            user_secret: blitz.config[blitz.id].user_secret
        }

        // Connect to api-node
        this.api = new BlitzQuery(options)

        // Load Endpoint Controller
        this.endpointController = new EndpointController()
        this.init()
    }

    /**
     * Initialization method called by EndpointHandler after passing methods
     */
    init() {

        // Listen to incoming requests & send config
        this.listen()

        // Listen on Reconnect
        this.api.on("connect", () => {
            blitz.log.verbose("Core      | " + [blitz.id] + " worker connected to target API")
        })

        this.api.on("disconnect", () => {
            blitz.log.verbose("Core      | " + [blitz.id] + " worker disconnected from target API")
        })
    }


    /**
     * Listen to incoming requests to be processed
     */
    listen() {
        this.listenForChecks()
        this.listenForRequests()
    }


    /**
     * Listen to incoming file checks
     */
    listenForChecks() {
        this.api.on("check", req => {

            // Check if file available
            try {
                this.endpointController.getEndpoint(req.url)
                blitz.log.silly("Core      | Check successful")
                this.api.emit(req.id, {
                    available: true
                })
            }

            // Not available -> let other nodes respond
            catch (err) {
                console.log(err)
                blitz.log.silly("Core      | Checked file not available")
                this.api.emit(req.id, {
                    available: false
                })
            }
        })
    }


    /**
     * Listen to incoming requests
     */
    async listenForRequests() {
        this.api.on("req", async req => {
            blitz.log.silly("Core      | Request received")
            req = CircularJSON.parse(req)
            let data = await this.endpointController.callEndpoint(req, this.api)
            blitz.log.silly("Core      | Request resolved")
            this.api.emit(req.id, data)
        })
    }
}


module.exports = Client
