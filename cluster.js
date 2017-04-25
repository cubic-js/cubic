/**
 * Globals
 */
require('./config/env.js')


/**
 * Dependencies
 */
const Cluster = require('multi-cluster')
const Logger = require('./config/logger.js')


/**
 * Big useless intro
 */
 Logger.intro()


/**
 * Setup Clusters
 * Single process & watch for development.
 */
if (process.env.environment === 'development') {
    let api = new Cluster('./api/node.js', 1)
    api.watch('./api')

    let src = new Cluster('./core/node.js', 1)
    src.watch('./core')
}
