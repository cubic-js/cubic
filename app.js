#!/usr/bin/env node

require('./config/env.js')
global.cli = require('./bin/logger.js')

/**
 * Start time measurements
 */
cli.time('Root', 'Set up Auth Node in')

/**
 * Dependencies
 */
const auth = require('./controllers/auth.js')

/**
 * Set up express server
 */
const app = require('./bin/server.js')

/**
 * Config Routes
 */
require('./config/routes.js')(app, auth)
