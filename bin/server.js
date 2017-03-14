/**
 * server.js, initializes network adapters
 * httpAdapter (express)
 * socketAdapter (Socket.IO)
 */

/**
 * Local Dependencies
 */
const debug = require('./debugger.js')
const cli = require('./logger.js')


/**
 * Express Dependencies
 */
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const port = debug.normalizePort(process.env.PORT || '7119')
cli.time('http', ('Express Server on :' + port + ' in'))


/**
 * Set Up
 */
const app = express()
app.set('port', port)
app.use(bodyParser.urlencoded({extended: false})).use(bodyParser.json())


/**
 * Start HTTP server.
 */
const server = http.createServer(app)
server.listen(port)


/**
 * Event Handling
 */
server.on('error', err => debug.onError(err, port))

server.on('listening', listener => {

    // include debugging
    debug.onListening(listener, server)

    // End http server timer
    cli.timeEnd('http', ('Express Server on :' + port + ' in'))
    cli.timeEnd('Root', 'Set up Auth Node in') // From server.js
})

module.exports = app
