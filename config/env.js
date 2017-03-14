/**
 * Default Development Values for Env Variables
 */

const fs = require('fs')

// Databases
process.env['redis_port'] = 6379
process.env['mongo_port'] = 27017

// Issuer (self)
process.env['iss'] = 'http://localhost:7119'

// Secrets
process.env['cert'] = fs.readFileSync('./config/certs/private.pem')
