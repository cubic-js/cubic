'use strict'

/**
 * Connect to mongodb for all methods
 */
const mongodb = require("mongodb").MongoClient
let db = null
mongodb.connect(blitz.config.core.mongoURL, (err, connected) => {
    if(err) throw(err)
    db = connected
})


/**
 * Shared api client
 */
const client = require("./connections/client.js")


/**
 * Class describing generic database/calculation methods
 * Any lower-level method extends this class
 */
class Endpoint{

    /**
     * Describes Endpoint properties
     * @constructor
     */
    constructor(){

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
        this.client = client.api.client
    }


    /**
     * Publish Data for a specific endpoint
     */
    publish(endpoint, data) {
        let update = {
            endpoint: endpoint,
            data: data
        }
        this.client.emit("PUBLISH", update)
    }
}

module.exports = Endpoint
