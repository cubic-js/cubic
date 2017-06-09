'use strict'

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
            url: "",
            query: [],
            scope: 'basic-read',
            method: 'GET',
            description: "There is no description for this endpoint yet."
        }
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
