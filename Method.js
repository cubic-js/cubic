'use strict'

/**
 * Connect to mongodb for all methods
 */
let mongodb = require("mongodb").MongoClient
let db = null
mongodb.connect(blitz.config.core.mongoURL, (err, connected) => {
    if(err) throw(err)
    db = connected
})

/**
 * Class describing generic database/calculation methods
 * Any lower-level method extends this class
 */
class Method{

    /**
     * Creates a new API call
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
    }

    /**
     * Gets cached values if available
     * @param {string} collection - Collection to cache
     * @param {object} query - Current query
     * @param {object} params - Additional selection parameters
     * @return {object[]} Cached documents
     */
    getCache(collection, query, params) {
        this.db.collection(collection + '-cache').findOne(query, (err, result) => {
            // Return object, default empty
            let docs = []

            // Append objects that fit the params
            if (result) {
                result = result['_cached_documents']
                for (let i = 0; i < result.length; i++) {
                    let currentDoc = result[i]

                    // Loop trough params
                    let paramsCorrect = true
                    for (let key in params) {
                        if (params.hasOwnProperty(key)) {
                            // Does current doc own that key?
                            if (currentDoc.hasOwnProperty(key)) {
                                // Is the property selected?
                                if (currentDoc[key] != params[key]) {
                                    paramsCorrect = false
                                    break
                                }
                            }
                        }
                    }

                    // Append to selected docs
                    if (paramsCorrect) docs.push(currentDoc)
                }
            }

            // Return documents
            return docs
        })
    }

    /**
     * Caches new values
     * @param {string} collection - Collection to cache
     * @param {object} query - Current query
     * @param {object[]} documents - Documents to cache
     */
    setCache(collection, query, documents) {
        query['_cached_documents'] = documents
        this.db.collection(collection + '-cache').insertOne(query)
    }
}

module.exports = Method
