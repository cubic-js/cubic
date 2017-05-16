'use strict'

/**
 * Mongodb connection for data processing
 */
const mongodb = require("mongodb").MongoClient
let db = null
mongodb.connect(blitz.config.core.mongoURL, (err, connected) => {
    if (err) throw (err)
    db = connected
})


/**
 * Shared api client
 */
const client = require("./controllers/api.js")


/**
 * Class describing generic database/calculation methods
 * Any lower-level method extends this class
 */
class Endpoint {

    /**
     * Describes Endpoint properties
     * @constructor
     */
    constructor() {

        /**
         * Default schema for API calls
         * @type {{resources: Array, params: Array, scope: string, verb: string, description: string}}
         */
        this.schema = {
            resources: [],
            params: [],
            scope: 'basic-read',
            verb: 'GET',
            description: "There is no description for this endpoint yet."
        }

        /**
         * MongoDB database
         * @type {Db}
         */
        this.db = db

        /**
         * Shared API Client
         * @type {Client}
         */
        this.api = client.api.client
    }


    /**
     * Publish Data for a specific endpoint
     */
    publish(endpoint, data) {
        let update = {
            endpoint: endpoint,
            data: data
        }
        this.api.emit("PUBLISH", update)
    }


    /**
     * Send data to be cached for endpoint on API node
     */
    cache(key, value, exp) {
        let data = {
            key: key,
            value: value,
            exp: exp
        }
        this.api.emit("CACHE", data)
    }


    /**
     * Generate URL from schema
     */
    getURL(resources, params) {
        let url = "/warframe/v1/items/" + (resources.length > 0 ? resources[0] + "/" : "") + "statistics?"

        this.schema.params.forEach((param, i) => {

            // Function? Get return value
            if (typeof param.default === "function") {
                url = this.appendFunction(url, param, params[i]) || url
            }

            // Default is primitive
            else {
                url = this.appendPrimitive(url, param, params[i]) || url
            }
        })

        // Remove "?" if last char
        if (url.slice(-1) === "?") url = url.slice(0, -1)

        // Replace space with %20
        url = url.replace(" ", "%20")

        return url
    }

    appendFunction(url, param, value) {
        let defaultValue = param.default()

        // Date? Consider +-5s for connections
        if (param.date) {
            if (!(defaultValue < value + 5000 && defaultValue > value - 5000)) {
                url += url.slice(-1) === "?" ? "" : "&"
                url += param.name + "=" + value
                return url
            }
        }

        // No date
        else {
            return this.appendPrimitive(url, param, value)
        }
    }

    appendPrimitive(url, param, value) {
        if (value !== param.default) {
            url += url.slice(-1) === "?" ? "" : "&"
            url += param.name + "=" + value
            return url
        }
    }
}

module.exports = Endpoint
