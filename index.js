/**
 * blitz.js authentication server
 * Web-API to get authentication for resource servers
 */
const local = require("./config/local.js")
const worker = require("blitz-js-util")
const path = require('path')
const fs = require("fs")
const promisify = require("util").promisify
const readFile = promisify(fs.readFile)
const webpack = require('webpack')

/**
 * Loader for auth-node system. For ease of maintenance, the auth-node consists
 * of a core-node that is connected to its own api-node as web server, much
 * like a regular blitz.js project
 */
class View {
    constructor(options) {

        // Process forked
        if (process.env.isWorker) {
            this.setup = worker.setGlobal()
            this.setup.then(() => this.init())
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
    init() {
        this.initBlitz()
        this.initWebpack()
    }


    /**
     * Nodes must be required here, otherwise worker spawn will trigger them to create
     * a new object on require due to process.env.isWorker = true. (which won't
     * work because no config is set)
     */
    initBlitz() {
        delete process.env.isWorker
        const Core = require("../blitz-js-core")
        const API = require("../blitz-js-api")
        const Blitz = require("blitz-js")(blitz.config.local)

        // Apply config to nodes and hook them
        let options = blitz.config[blitz.id]

        // API node which controls incoming requests
        options.id = "view_api"
        blitz.use(new API(options))

        // Core Node which processes incoming requests
        options.id = "view_core"
        blitz.use(new Core(options))

        // Set proces state back to original
        process.env.isWorker = true
    }


    /**
     * Initialize Webpack
     */
    async initWebpack() {
        const timer = new Date
        const clientConfig = require('./config/webpack/client.config')
        const serverConfig = require('./config/webpack/server.config')
        const compiler = webpack([clientConfig, serverConfig])
        if (compiler.errors) {
            throw compiler.errors
        } else {
            blitz.log.monitor("Webpack build successful", true, `${new Date - timer}ms`)
        }
        compiler.watch({}, (err, stats) => {
            if (err) console.log(err)
        })
    }
}

module.exports = process.env.isWorker ? new View() : View
