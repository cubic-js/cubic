/**
 * Module Dependencies
 */
const fs = require('fs')
const path = require('path')
const util = require('util')
const _ = require('lodash')
const BlitzUtil = require("blitz-js-util")


/**
 * Interface for handling endpoints
 */
class EndpointHandler {

    constructor() {
        // When config received, launch client
        process.on("message", (m) => {

            if (m.global) {

                // Set global blitz object
                BlitzUtil.generateBlitzGlobal(m.global)

                // Initialize Endpoint Parent with API Client
                require(blitz.config.core.endpointParent)
            }
        })
    }


    /**
     * Calls endpoint with given param Array
     * @param {object} options - Options to pass to endpoint
     * @returns {Promise} Calculated data from endpoint
     */
    callEndpoint(request) {
        let endpoint = new(require(request.file))
        endpoint.url = request.url
        
        return new Promise((resolve, reject) => {
            endpoint.main.apply(endpoint, request.params).then(data => resolve(data))
        })
    }


    /**
     * Generates flat endpoint schema from endpoint tree
     * @returns {Array} Flat endpoint schema
     */
    generateEndpointSchema() {

        // Generate File Tree
        let config = []
        config.push(util.inspect(this.getMethodTree(blitz.config.core.endpointPath, config), false, null))
        config = _.flattenDeep(config)

        // Cleanup
        let parsed = []

        for (var i = 0; i < config.length; i++) {
            if (typeof config[i] !== "string" && Object.keys(config[i]).length !== 0) {
                parsed.push(config[i])
            }
        }

        // Return config to send to api node
        return parsed
    }


    /**
     * Generates endpoint tree
     * @param {string} filename - Method file path
     * @param {array} config - Config array to push available endpoints into
     * @returns {Object} Method endpoint tree
     */
    getMethodTree(filename, config) {
        let stats = fs.lstatSync(filename)
        let endpoint = {}

        // Folder
        if (stats.isDirectory()) {
            config.push(fs.readdirSync(filename).map((child) => {
                return this.getMethodTree(filename + '/' + child, config)
            }))
        }

        // File -> Set endpoint config
        else {

            // Basic File information
            endpoint.file = filename.replace("//", "/").replace("./core/", "./")
            endpoint.endpoint = path.basename(filename).replace(".js", "")

            // Custom schema values
            let schema = new(require(endpoint.file))().schema

            // Routes
            endpoint.route = filename.replace(blitz.config.core.endpointPath, "").replace(".js", "")

            if (schema.resources !== false) {
                let url = endpoint.route.split('/')

                // Add each resource to route, then replace original
                schema.resources.forEach(resource => {
                    url.splice((url.length - 1), 0, ':' + resource) // before endpoint, but not -2 because split has empty first el due to route starting with '/'
                })
                endpoint.route = url.join('/')
            }

            // Stringify functions to be preserved on socket.io's emit
            Object.keys(schema.params).map((i) => {
                let param = schema.params[i]
                if (typeof param.default === 'function') {
                    schema.params[i].default = param.default.toString()
                }
            })
            endpoint.params = schema.params

            // Other Modified values
            endpoint.scope = schema.scope
            endpoint.verb = schema.verb
            endpoint.description = schema.description
        }

        return endpoint
    }
}

module.exports = new EndpointHandler()
