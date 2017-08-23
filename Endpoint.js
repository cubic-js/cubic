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
            scope: '',
            method: 'GET',
            description: "There is no description for this endpoint yet."
        }
        this.api = api
        this.db = db
        this.url = req ? req.url : null
        this.req = req
    }


    /**
     * Just render the given view if no other data is given
     * The data object only affects the initial template, i.e. head and
     * css management. Component data must be handled directly through vue.
     */
    async main() {
        return this.render()
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
    async render(data) {
        return {
            method: "send",
            body: await view.render(this.req.url, data)
        }
    }
}

module.exports = Endpoint
