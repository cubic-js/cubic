/**
 * Module Dependencies
 */
const fs = require('fs')
const path = require('path')
const util = require('util')
const _ = require('lodash')
const mongodb = require("mongodb").MongoClient
const CircularJSON = require("circular-json")


/**
 * Interface for handling endpoints
 */
class EndpointController {

    /**
     * Initialize Connections used by individual endpoints
     */
    constructor() {
        this.db = mongodb.connect(blitz.config[blitz.id].mongoURL)
        this.generateEndpointSchema()
    }


    /**
     * Calls endpoint with given param Array
     */
    async getResponse(req, api) {
        try {
            return await this.sendRaw(req, api)
        } catch (err) {
            return await this.callEndpoint(req, api)
        }
    }


    /**
     * Send raw file if available
     */
    async sendRaw(req, api) {
        let readFile = util.promisify(fs.readFile)
        let filename = blitz.config[blitz.id].publicPath + req.url
        let raw = await readFile(filename)

        api.emit("cache", {
            scope: "",
            key: req.url,
            value: raw,
            exp: blitz.config[blitz.id].cacheDuration
        })
        return {
            body: raw
        }
    }


    /**
     * Calls endpoint with given param Array
     */
     async callEndpoint(req, api) {
         req.url = req.url.split("%20").join(" ")
         const parsed = this.parse(req)
         const invalid = this.validateRequest(req, parsed)
         const Endpoint = require(parsed.endpoint.file)
         const endpoint = new Endpoint(api, await this.db, req)

         // Apply to endpoint
         if (!invalid) {
             return endpoint.main.apply(endpoint, parsed.query)
                 .then(data => {
                     return {
                         statusCode: data.statusCode,
                         method: data.method,
                         body: data.body || data
                     }
                 })
                 .catch(err => {
                     if (blitz.config.local.environment === "development") {
                         console.log(err)
                     }
                     return {
                         statusCode: err.statusCode || 400,
                         method: err.method,
                         body: err.body || err
                     }
                 })
         } else {
             return invalid
         }
     }


     /**
      * Check request method and authorization before processing request
      */
     validateRequest(req, parsed) {
         if (!req.user.scp.includes(parsed.endpoint.scope)) {
             return {
                 statusCode: 401,
                 body: {
                     error: "Unauthorized",
                     reason: `Expected ${parsed.endpoint.scope}, got ${req.user.scp}.`
                 }
             }
         }
         if (req.method.toLowerCase() !== parsed.endpoint.method.toLowerCase()) {
             return {
                 statusCode: 405,
                 body: {
                     error: "Method not allowed.",
                     reason: `Expected ${parsed.endpoint.method}, got ${req.method}.`
                 }
             }
         }
     }


     /**
      * Get specific endpoint through url detection
      */
     findByUrl(url) {
         let found = true
         let reqUrl = url.split("?")[0].split("/")

         for (let endpoint of this.endpoints) {
             let route = endpoint.route.split("/")
             if (route.length === reqUrl.length) {
                 for (let i = 0; i < reqUrl.length; i++) {
                     if (route[i] !== reqUrl[i] && !route[i].includes(":")) {
                         found = false
                         break
                     } else if (i === reqUrl.length - 1) {
                         found = endpoint
                     }
                 }
                 if (found) break
             }
         }
         return found
     }


    /**
     * Generates flat endpoint schema from endpoint tree
     */
    generateEndpointSchema() {
        this.endpoints = []
        this.getEndpointTree(blitz.config[blitz.id].endpointPath)

        // Reorder items which must not override previous url's with similar route
        // e.g. /something/:id must not be routed before /something/else
        let pushToStart = []
        let pushToEnd = []
        this.endpoints.forEach(endpoint => {
            if (endpoint.route.includes(":")) pushToEnd.push(endpoint)
            else pushToStart.push(endpoint)
        })
        this.endpoints = pushToStart.concat(pushToEnd)
    }


    /**
     * Generates endpoint tree
     */
    getEndpointTree(filename) {
        let stats = fs.lstatSync(filename)
        let endpoint = {}

        // Folder
        if (stats.isDirectory()) {
            fs.readdirSync(filename).map(child => {
                return this.getEndpointTree(filename + '/' + child)
            })
        }

        // File -> Set endpoint config
        else {
            let Endpoint = require(filename.replace("//", "/"))
            let endpoint = new Endpoint().schema

            // Routes
            endpoint.name = path.basename(filename).replace(".js", "")
            endpoint.file = filename
            let route = endpoint.file.replace(blitz.config[blitz.id].endpointPath, "").replace(".js", "")
            endpoint.route = endpoint.url ? endpoint.url : route
            this.endpoints.push(endpoint)
        }
    }


    /**
     * Get Endpoint from given URL
     */
    async getEndpoint(url) {

        // Try to get raw file in public folder
        try {
            if (url.includes("../")) {
                throw "Attempt to navigate outside of public folder not permitted."
            }
            let check = util.promisify(fs.stat)
            await check(blitz.config[blitz.id].publicPath + url)
        }

        // Assume dynamic endpoint if file not available
        catch (err) {
            let path = this.parseURL(url).endpoint.file
            return require(path)
        }
    }


    /**
     * Parse all requested input
     */
    parse(req) {
        let parsed = this.parseURL(req.url)
        this.parseParams(parsed.query, parsed.endpoint)
        parsed.query = this.parseBody(req).concat(parsed.query)
        return parsed
    }


    /**
     * Parse URL into filepath and query params
     */
    parseURL(url) {
        url = url === "" ? "/" : url
        let route = url.split("?")[0]
        let endpoint = this.findByUrl(route)
        let placeholders = endpoint.route.split(":").length - 1
        let totalParams = placeholders + endpoint.query.length
        let query = new Array(totalParams)

        // Assign placeholder data
        let eurl = endpoint.route.split("/")
        let curl = url.split("/")

        for (let i = 0; i < eurl.length; i++) {
            let index = 0
            let fragment = eurl[i]
            if (fragment.includes(":")) {
                query[index] = curl[i]
                index++
            }
        }

        // Get query params
        let regex = /(\?)([^=]+)\=([^&]+)/
        let matching = regex.exec(url)

        while (matching) {
            for (let i = 0; i < endpoint.query.length; i++) {
                if (matching[2] === endpoint.query[i].name) {
                    query[i + placeholders] = matching[3]
                }
            }
            url = url.replace(matching[0], "").replace("&", "?")
            matching = regex.exec(url)
        }
        return {
            query: query,
            endpoint: endpoint
        }
    }


    /**
     * Convert string params from URL to target type
     */
    parseParams(query, endpoint) {
        let placeholders = endpoint.route.split(":").length - 1
        endpoint.query.forEach((param, i) => {
            let index = i + placeholders
            let value = query[index]
            let def = typeof param.default === "function" ? param.default() : param.default

            // Convert value to target type
            if (value) {
                if (typeof def === "number") {
                    query[index] = parseFloat(value)
                }
                if (typeof def === "boolean") {
                    query[index] = value == "true" || value == "1"
                }
                if (typeof def === "object") {
                    query[index] = JSON.stringify(value)
                }
            }

            // No value given, use default
            else {
                query[index] = def
            }
        })
    }


    /**
     * Parse body of incoming POST/PUT/etc requests
     */
    parseBody(req) {
        return req.body && Object.keys(req.body).length > 0 ? [req.body] : []
    }
}

module.exports = EndpointController
