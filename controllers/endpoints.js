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
                data: endpoints,
            }

            // Save in db
            this.db.config.updateOne({
                type: "endpoints"
            }, {
                $set: config
            }, {
                upsert: true
            })
            .then(() => resolve())

            // Save locally
            this.saveSchema(config, adapter)
        })
    }


    /**
     * Route Endpoints on Express
     */
    routeEndpoints(adapter) {
        if (adapter.app) {
            adapter.request.schema.endpoints.forEach((endpoint) => {
                adapter.app.all(endpoint.route, (req, res) => adapter.prepass(req, res))
            })
        }
    }


    /**
     * Save Schema for given adapter
     */
    saveSchema(config, adapter) {

        // Save new schema
        this.convertSchema(config.data)
        adapter.request.schema.endpoints = config.data
        adapter.request.schema.uat = new Date()
        this.routeEndpoints(adapter)
    }


    /**
     * Refresh endpoint config every minute or if schema has no endpoints
     */
    compareSchema(adapter) {
        if (new Date() - adapter.request.schema.uat > 60000 || !adapter.request.schema.endpoints) {
            this.db.config.findOne({
                    type: "endpoints"
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
        if (Object.keys(endpoint.params).length > 0) {
            endpoint.params.forEach((specs, i) => {

                // If string -> check if function (workaround for json.stringify on socket.emit)
                if (typeof specs.default === "string" && (specs.default.includes(") => {") || specs.default.includes("function ("))) {

                    // Function from String (remove everything before first { and last }), override default
                    let fn = new Function(specs.default.substring(specs.default.indexOf("{") + 1).slice(0, -1))
                    endpoint.params[i].default = fn
                }
            })
        }
    }


    /**
     * Verify Request Validity with cached data from core-node
     */
    parse(req, schema) {
        req = this.parseBase(req)

        for (var sub in schema.endpoints) {
            let endpoint = schema.endpoints[sub]
            let matching = false
            let params = []

            // Check if method in Schema
            matching = this.parseRoute(req, endpoint, params, matching)

            // Route matches
            if (matching) {
                if (!req.user.scp.includes(endpoint.scope)) {
                    return {
                        statusCode: 401,
                        body: 'Unauthorized. Expected ' + endpoint.scope + " scope, got " + req.user.scp + "."
                    }
                }
                if (req.verb !== endpoint.verb) {
                    return {
                        statusCode: 405,
                        body: "Invalid Method. Expected " + endpoint.verb + ", got " + req.verb + "."
                    }
                }

                // Check params for value matching. No match -> res truthy
                let res = this.parseParams(req, endpoint, params)
                if (res) return res

                // If POST or PUT, append body
                this.parseBody(req, params)

                return {
                    statusCode: 200,
                    url: req.url,
                    file: endpoint.file,
                    params: params
                }
            }
        }

        // No endpoint matched
        return {
            statusCode: 404,
            body: "No endpoint matched the request."
        }
    }


    /**
     * Get Base information from request, used by further methods
     */
    parseBase(req) {
        let route = req.url.split("/")
        route.pop()
        route = (`${route.join("/")}/${req.parsed.method}`).replace("%20", " ")

        let request = {
            user: req.user,
            verb: req.method,
            route: route,
            url: req.url,
            method: req.parsed.method,
            params: req.parsed.params,
            body: req.body
        }

        return request
    }


    /**
     * Match request route w/ given route and assign resources
     */
    parseRoute(req, endpoint, params, matching) {
        let reqroute = req.route.split("/")
        let schemaroute = endpoint.route.split("/")

        // Remove last char if "/"
        reqroute[reqroute.length - 1] === "" ? reqroute.splice(-1, 1) : null
        schemaroute[schemaroute.length - 1] === "" ? schemaroute.splice(-1, 1) : null

        if(schemaroute.length === reqroute.length) {
            for (var i = 0; i < schemaroute.length; i++) {

                // Get route resource params
                if (schemaroute[i][0] === ":") {
                    matching = true
                    params.push(reqroute[i])
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
     * Parse Params if route matches
     */
    parseParams(req, endpoint, params) {
        for (var i = 0; i < endpoint.params.length; i++) {
            let specs = endpoint.params[i]

            // Param included in request?
            let requested = false
            Object.keys(req.params).map((key, index) => {
                if (key === specs.name) requested = req.params[key]
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

                params.push(requested)
            }

            // Not requested -> assign default value
            else {
                if (typeof specs.default === "function") params.push(specs.default())
                else params.push(specs.default)
            }
        }
    }


    /**
     * Add Body to Params so they're accessible in endpoint
     */
    parseBody(req, params) {
        if (req.verb === "POST" || req.verb === "PUT") {
            params.push(req.body)
        }
    }
}

module.exports = new EndpointController()
