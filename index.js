/**
 * blitz.js authentication server
 * Web-API to get authentication for resource servers
 */
const extend = require("deep-extend")
const local = require("./config/local.js")
const preauth = require("./hooks/preauth.js")
const purge = require("./hooks/purge.js")
const worker = require("blitz-js-util")


/**
 * Loader for auth-node system. For ease of maintenance, the auth-node consists
 * of a core-node that is connected to its own api-node as web server, much
 * like a regular blitz.js project
 */
class Auth {
    constructor(options) {

        // Process forked
        if (process.env.isWorker) {
            this.setup = worker.setGlobal()
            this.setup.then(() => this.hookDependencies())
            worker.expose(this)
        }

        // Process not forked
        else {

            // Config which is called by blitz.js on blitz.use()
            this.config = {
                local: local,
                provided: options
            }

            // Path for forking
            this.filename = __filename
        }
    }


    /**
     * Hook node components for actual logic
     */
    async hookDependencies() {
        /**
         * Nodes must be required here, otherwise worker spawn will trigger them to create
         * a new object on require due to process.env.isWorker = true. (which won't
         * work because no config is set)
         */
        delete process.env.isWorker
        const Core = require("blitz-js-core")
        const API = require("blitz-js-api")
        const Blitz = require("blitz-js")(blitz.config.local)

        // Apply config to nodes and hook them
        let options = blitz.config[blitz.id]

        // API node which controls incoming requests
        options.id = "auth_api"
        blitz.hook(options.id, purge.watch)
        blitz.use(new API(options))
        preauth.validateWorker()

        // Core Node which processes incoming requests
        options.id = "auth_core"
        blitz.hook(options.id, preauth.verifyIndices)
        blitz.hook(options.id, preauth.manageDevUser)
        blitz.use(new Core(options))

        // Set proces state back to original
        process.env.isWorker = true
    }
}

module.exports = process.env.isWorker ? new Auth() : Auth
