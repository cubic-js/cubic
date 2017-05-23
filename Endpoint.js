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
        this.api = client.api
    }


    /**
     * Publish Data for a specific endpoint
     */
    publish(endpoint, data) {
        let update = {
            endpoint: endpoint,
            data: data
        }
        this.api.emit("publish", update)
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
        this.api.emit("cache", data)
    }


    /**
     * Helper function to safely set attributes in object
     */
    set(key, value) {
        this[key] = value
    }
}

module.exports = Endpoint
