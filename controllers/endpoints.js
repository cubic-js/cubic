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
                .then((err, config) => {
                    if (config) this.saveSchema(config, adapter)
                })
        }
    }


    /**
     * Converts Schema to local standards & converts string functions to real functions
     */
    convertSchema(endpoints) {
        for (var endpoint in endpoints) {
            this.convertParams(endpoints[endpoint])
        }
    }


    /**
     * Convert stringified functions to anonymous functions
     */
    convertParams(endpoint) {
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
                if (!endpoint.scope.includes(req.user.scp)) return "unauthorized"
                if (req.verb !== endpoint.verb) return false

                this.parseParams(req, endpoint, params)
                this.parseBody(req, params)

                return ({
                    file: endpoint.file,
                    params: params
                })
            }
        }

        // No endpoint matched
        return false
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
        let scmroute = endpoint.route.split("/")

        for (var i = 0; i < scmroute.length; i++) {

            // Get route resource params
            if (scmroute[i][0] === ":") {
                matching = true
                params.push(reqroute[i])
            } else if (scmroute[i] !== reqroute[i]) {
                matching = false
                break
            } else {
                matching = true
            }
        }

        return matching
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
                if (specs.type === "number") {
                    if (isNaN(requested)) return false
                    else requested = parseFloat(requested)
                }
                else if (specs.type.includes("bool")) {
                    requested = (requested == "true" || requested == "1" || requested == 1)
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
     * Parse Body if POST/PUT
     */
    parseBody(req, params) {
        if (req.verb === "POST" || req.verb === "PUT") {
            params.push(req.body)
        }
    }
}

module.exports = new EndpointController()
