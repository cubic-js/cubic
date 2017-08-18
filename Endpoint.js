const extend = require("deep-extend")
const view = require("./controllers/view.js")


/**
 * Class describing generic database/calculation methods
 * Any lower-level method extends this class
 */
class Endpoint {

    /**
     * Describes Endpoint properties
     */
    constructor(api, db, req) {

        /**
         * Default schema for API calls
         */
        this.schema = {
            query: [],
            scope: 'basic-read',
            method: 'GET',
            description: "There is no description for this endpoint yet."
        }
        this.api = api
        this.db = db
        this.url = req ? req.url : null
        this.req = req
    }


    /**
     * Publish Data for a specific endpoint
     */
    publish(endpoint, data) {
        let update = {
            endpoint,
            data
        }
        this.api.emit("publish", update)
        blitz.log.verbose("Core      | Sending data to publish for " + endpoint)
    }


    /**
     * Send data to be cached for endpoint on API node
     */
    cache(key, value, exp) {
        let data = {
            key,
            value,
            exp,
            scope: this.schema.scope
        }
        this.api.emit("cache", data)
        blitz.log.verbose("Core      | Sending data to cache for " + key)
    }


    /**
     * Render page with Vue.js
     */
    async render(template, data) {
        data = extend({
            head: {
                title: "New Blitz.js Project",
                meta: []
            },
            app: {}
        }, data)
        return {
            method: "send",
            body: await view.render(template, data)
        }
    }
}

module.exports = Endpoint
