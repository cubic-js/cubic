const jwt = require("jsonwebtoken")

/**
 * Describes authorization protocol for socket/http requests
 */
class Authentication {

    /**
     * Force JWT auth on all routes
     * No token -> Default user
     */
    configExpress(app) {

        // Verify JWT
        app.use((req, res, next) => this.verifyExpress(req, res, next))

        // Middleware Error Handler
        app.use((err, req, res, next) => res.status(err.status || 500).send(err.message))
    }


    /**
     * Verify JWT on socket connect to assing socket.user on handshake
     */
    configSockets(sockets) {

        // JWT Verification on handshake (uses native middleware)
        sockets.io.use((socket, next) => this.verifySocket(socket, next))

        // JWT Verification on each transaction (goes through adapter middleware)
        sockets.use((req, res, next) => this.verifyExpiration(req, res, next))

        // Root Namespace middleware
        sockets.root.use((socket, next) => this.verifySocket(socket, next))
        sockets.root.use((socket, next) => this.authorize(socket, next))
    }


    /**
     * Express Middleware to verify JWT if present. Also adds user to req.
     */
    verifyExpress(req, res, next) {
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        req.user = {
            uid: ip,
            scp: "basic-read"
        }

        // Token present?
        if (req.headers.authorization) {
            let token = req.headers.authorization.replace("bearer ", "").replace("Bearer ", "")

            // Set req.user from token
            try {
                req.user = jwt.verify(token, blitz.config[blitz.id].certPublic)
                blitz.log.verbose("HTTP      | " + ip + " connected as " + req.user.uid)
                return next()
            }

            // Invalid Token
            catch (err) {
                blitz.log.verbose("HTTP      | " + ip + " rejected (" + err + ")")
                return next(err)
            }
        }

        // No token provided
        else {
            blitz.log.verbose("HTTP      | " + req.user.uid + " connected without token")
            next()
        }
    }


    /**
     * Socket.io Middleware to verify JWT if present. Also adds user to req.
     */
    verifySocket(socket, next) {
        let ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address || socket.request.connection.remoteAddress
        socket.user = {
            uid: ip,
            scp: "basic-read"
        }

        // Token sent at all?
        if (socket.handshake.query.bearer) {
            let token = socket.handshake.query.bearer

            // Set req.user from token
            try {
                socket.user = jwt.verify(token, blitz.config[blitz.id].certPublic)
                blitz.log.verbose("Socket.io | " + ip + " connected as " + socket.user.uid + " on " + socket.nsp.name)
                return next()
            }

            // Invalid Token
            catch (err) {
                blitz.log.verbose("Socket.io | " + socket.user.uid + " rejected (" + err + ") on " + socket.nsp.name)
                return next(new Error(err))
            }
        }

        // No Token provided
        else {
            blitz.log.verbose("Socket.io | " + socket.user.uid + " connected without token on " + socket.nsp.name)
            return next()
        }
    }


    /**
     * JWT Expiration check middleware for sockets (run on each prepass())
     */
    verifyExpiration(req, res, next) {
        if (new Date().getTime() / 1000 - req.user.exp > 0) {
            blitz.log.verbose("API       | " + req.user.uid + " rejected (jwt expired)")
            return next("jwt expired")
        } else {
            return next()
        }
    }


    /**
     * Authorizes sockets attempting connections to higher namespaces
     */
    authorize(socket, next) {
        if (socket.nsp.name === "/root" && socket.user.scp.includes("root")) {
            return next()
        }

        // No criteria matched
        blitz.log.verbose("Socket.io | Rejected connection to " + socket.nsp.name)
        return next(new Error(`Rejected connection to ${socket.nsp.name}`))
    }
}

module.exports = new Authentication()
