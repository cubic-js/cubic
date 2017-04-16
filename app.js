#!/usr/bin/env node

require('./config/env.js')

/**
 * Set up express server
 */
const server = require('./connections/server.js')
