"use strict";

const mongodb = require("mongodb").MongoClient
const _ = require("lodash")

/**
 * Endpoint Controller for managing Endpoints from resource nodes
 */
class EndpointController {

    /**
     * Connect to databases
     */
    connect() {
        return new Promise((resolve, reject) => {
            this.db = mongodb
            this.db.connect(blitz.config.api.mongoURL, (err, db) => {
                if (!err) {
                    this.db.config = db.collection("config")
                    resolve()
                }
            })
        })
    }


    /**
     * Saves endpoints from core node to db
     */
    saveEndpoints(endpoints, adapter) {
        return new Promise((resolve, reject) => {
            let config = {
                type: "endpoints",
                data: _.cloneDeep(endpoints), // clone to prevent overwriting
            }

            // Save in db
            this.db.config.updateOne({
                _id: "endpoints"
            }, {
                $set: config
            }, {
                upsert: true
            })
            .then(() => resolve())
            .catch(() => {}) // ignore duplicate error

            // Save locally
            this.saveSchema(config, adapter)
        })
    }


    /**
     * Save Schema for given adapter
     */
    saveSchema(config, adapter) {

        // Save new schema
        this.convertSchema(config.data)
        adapter.request.schema.endpoints = config.data
        adapter.request.schema.uat = new Date()
    }


    /**
     * Refresh endpoint config every minute or if schema has no endpoints
     */
    compareSchema(adapter) {
        if (new Date() - adapter.request.schema.uat > 60000 || !adapter.request.schema.endpoints) {
            this.db.config.findOne({
                    _id: "endpoints"
                })
                .then(config => {
                    if (config) this.saveSchema(config, adapter)
                })
        }
    }


    /**
     * Converts Schema to local standards & converts string functions to real functions
     */
    convertSchema(endpoints) {
        for (var endpoint in endpoints) {
            this.convertDefaults(endpoints[endpoint])
        }
    }


    /**
     * Convert stringified functions to anonymous functions
     */
    convertDefaults(endpoint) {
        if (Object.keys(endpoint.query).length > 0) {
            endpoint.query.forEach((specs, i) => {

                // If string -> check if function (workaround for json.stringify on socket.emit)
                if (typeof specs.default === "string" && (specs.default.includes("=>") || specs.default.substring(0, 8) == 'function')) {

                    // Function from String (remove everything before first { and last }), override default
                    let fn = new Function(specs.default.substring(specs.default.indexOf("{") + 1).slice(0, -1))
                    endpoint.query[i].default = fn
                }
            })
        }
    }


    /**
     * Verify Request Validity with cached data from core-node
     */
    parse(req, schema) {
        req = this.parseBase(req)
        let found = false
        let query = []
        let err = {
            statusCode: 404,
            body: "No endpoint matched the request."
        } // Default error if not overwritten

        for (let endpoint of schema.endpoints) {

            // Check if method in Schema
            let matching = this.parseRoute(req, endpoint, query)

            // Route matches
            if (!found && matching) {
                if (!req.user.scp.includes(endpoint.scope)) {
                    err = {
                        statusCode: 401,
                        body: 'Unauthorized. Expected ' + endpoint.scope + " scope, got " + req.user.scp + "."
                    }
                }
                else if (req.method !== endpoint.method) {
                    err = {
                        statusCode: 405,
                        body: "Invalid Method. Expected " + endpoint.method + ", got " + req.method + "."
                    }
                }
                else {
                    found = endpoint
                    err = false
                }
            }
        }

        // No errors -> allow request
        if (!err) {

            // Check query for value matching. No match -> res truthy
            let res = this.parseQuery(req, found, query)

            // Returned value contains specific query error
            if (res) return res

            // If POST or PUT, append body
            this.parseBody(req, query)

            return {
                statusCode: 200,
                url: req.url,
                file: found.file,
                query: query
            }
        }

        // No matching endpoint or errors
        else {
            return err
        }
    }


    /**
     * Get Base information from request, used by further methods
     */
    parseBase(req) {
        return {
            user: req.user,
            method: req.method,
            url: req.url,
            route: req.parsed.route,
            endpoint: req.parsed.endpoint,
            query: req.parsed.query,
            body: req.body
        }
    }


    /**
     * Match request route w/ given route and assign resources
     */
    parseRoute(req, endpoint, query) {
        let reqroute = req.route.split("/")
        let schemaroute = endpoint.route.split("/")
        let matching = false

        // Remove last char if "/"
        reqroute[reqroute.length - 1] === "" ? reqroute.splice(-1, 1) : null
        schemaroute[schemaroute.length - 1] === "" ? schemaroute.splice(-1, 1) : null

        if (schemaroute.length === reqroute.length) {
            for (var i = 0; i < schemaroute.length; i++) {

                // Get route resource query
                if (schemaroute[i][0] === ":") {
                    matching = true
                    query.push(reqroute[i])
                } else if (schemaroute[i] !== reqroute[i]) {
                    matching = false
                    break
                } else {
                    matching = true
                }
            }
            return matching
        }

        // if not same length -> endpoint can't match
        else {
            return false
        }
    }


    /**
     * Parse Query if route matches
     */
    parseQuery(req, endpoint, query) {
        for (var i = 0; i < endpoint.query.length; i++) {
            let specs = endpoint.query[i]

            // Param included in request?
            let requested = false
            Object.keys(req.query).map((key, index) => {
                if (key === specs.name) requested = req.query[key]
            })

            // Requested not falsy -> request value in `requested`
            if (requested) {
                let mismatch = false

                // Check data type
                if (specs.type === "number") {
                    if (isNaN(requested)) mismatch = true
                    else requested = parseFloat(requested)
                }
                else if (specs.type.includes("bool")) {
                    requested = (requested == "true" || requested == "1" || requested == 1)
                    if(!requested) mismatch = true
                }

                // Data types don't match
                if (mismatch) {
                    return {
                        statusCode: 400,
                        body: "Wrong param type for " + specs.name + ". Expected " + specs.type + ", got " + typeof requested + "."
                    }
                }

                query.push(requested)
            }

            // Not requested -> assign default value
            else {
                if (typeof specs.default === "function") query.push(specs.default())
                else query.push(specs.default)
            }
        }
    }


    /**
     * Add Body to Query so they're accessible in endpoint
     */
    parseBody(req, query) {
        if (req.method === "POST" || req.method === "PUT") {
            query.push(req.body)
        }
    }
}

module.exports = new EndpointController()
