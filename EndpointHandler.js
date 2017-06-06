/**
 * Module Dependencies
 */
const decache = require("decache")
const fs = require('fs')
const path = require('path')
const util = require('util')
const _ = require('lodash')


/**
 * Interface for handling endpoints
 */
class EndpointHandler {

    /**
     * Initialize Endpoint Parent with API Client
     */
    constructor() {
        require(blitz.config.core.endpointParent)
    }


    /**
     * Calls endpoint with given param Array
     * @param {object} options - Options to pass to endpoint
     * @returns {Promise} Calculated data from endpoint
     */
    callEndpoint(request) {
        return new Promise((resolve, reject) => {
            decache(request.file)
            let endpoint = new(require(request.file))

            // Apply to endpoint
            endpoint.url = request.url
            endpoint.main.apply(endpoint, request.query)
                .then(data => {
                    let res = {
                        statusCode: 200,
                        body: data
                    }
                    resolve(res)
                })
                .catch(err => {
                    let res = {
                        statusCode: 400,
                        body: err
                    }
                    resolve(res)
                })
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
        let pushToEnd = []

        for (var i = 0; i < config.length; i++) {
            if (typeof config[i] !== "string" && Object.keys(config[i]).length !== 0) {
                let route = config[i].route.split("/")
                route[route.length - 1].includes(":") ? pushToEnd.push(config[i]) : parsed.push(config[i])
            }
        }

        // Add items which must not override previous url's with similar route
        // e.g. /something/:id must not be routed before /something/else
        parsed = parsed.concat(pushToEnd)

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

            // Custom schema values
            let Endpoint = require(endpoint.file)
            let schema = new Endpoint().schema

            // Routes
            endpoint.route = filename.replace(blitz.config.core.endpointPath, "").replace(".js", "")

            // Stringify functions to be preserved on socket.io's emit
            Object.keys(schema.query).map((i) => {
                let param = schema.query[i]
                if (typeof param.default === 'function') {
                    schema.query[i].default = param.default.toString()
                }
            })
            endpoint.query = schema.query

            // Other Modified values
            endpoint.endpoint = path.basename(filename).replace(".js", "")
            endpoint.route = schema.url ? schema.url : filename.replace(blitz.config.core.endpointPath, "").replace(".js", "")
            endpoint.scope = schema.scope
            endpoint.method = schema.method
            endpoint.description = schema.description
        }

        return endpoint
    }
}

module.exports = EndpointHandler
