"use strict"

/**
 * JSON Web Tokens module to generate tokens
 */
const jwt = require('jsonwebtoken')
const randtoken = require('rand-token')


/**
 * Secret Secrecy
 */
const bcrypt = require('bcryptjs')


/**
 * Describes interactions with mongo for auth
 */
class Authentication {

    constructor() {

        // Connect to mongodb
        this.db = require('mongoose').connect(blitz.config.auth.mongoURL)
        this.db.Promise = global.Promise

        // Config models
        this.setSchema()
        this.users = this.db.model('User', this.userSchema)
    }


    /**
     * Check supplied user info & send token
     */
    matchCredentials(req, res, next) {

        // find user in db
        this.users.findOne({
            user_key: req.body.user_key
        })

        .then(user => {

            // No User Found
            if (!user) {
                this.unauthorized(res, req.body.user_key, req.headers['x-forwarded-for'] || req.connection.remoteAddress, 'credentials')
            } else

            // Password Mismatch
            if (!this.isValidSecret(req.body.user_secret, user.user_secret)) {
                this.unauthorized(res, req.body.user_key, req.headers['x-forwarded-for'] || req.connection.remoteAddress, 'credentials')
            } else {

                // Valid User Found
                this.saveIP(user.user_key, req.headers['x-forwarded-for'] || req.connection.remoteAddress, 'credentials', true)

                // Set Options
                let data = {
                    scp: this.getFullScope(user.scope),
                    uid: user.user_id,
                }

                // Get Tokens
                let accessToken = this.getAccessToken(data)
                let refreshToken = user.refresh_token ? user.refresh_token : this.getRefreshToken(user.user_key)

                return res.json({
                    access_token: accessToken,
                    refresh_token: refreshToken
                })
            }
        })

        .catch(err => {
            this.unauthorized(res, req.body.user_key, req.headers['x-forwarded-for'] || req.connection.remoteAddress, 'credentials')
        })
    }


    /**
     * Validates Refresh token, sends new access token
     */
    matchRefreshToken(req, res, next) {

        // Find refresh token in db
        this.users.findOne({
            refresh_token: req.body.refresh_token
        })

        .then(user => {

            // No Refresh Token found
            if (!user) {
                this.unauthorized(res)
            }

            // Valid User Found > Send token
            else {
                let data = {
                    scp: this.getFullScope(user.scope),
                    uid: user.user_id,
                }

                // Get Tokens
                let accessToken = this.getAccessToken(data)

                // Save IP
                this.saveIP(user.user_key, req.headers['x-forwarded-for'] || req.connection.remoteAddress, 'refresh_token', true)

                return res.status(200).json({
                    access_token: accessToken
                })
            }
        })

        .catch(err => {
            return err
        })
    }


    /**
     * Extend given minimum scope with any higher
     */
    getFullScope(scope) {
        let scopes = blitz.config.auth.scopes
        let scopeSplit = scope.split(" ")
        for (var i = 0; i < scopes.length; i++) {
            scopeSplit.forEach((subscope) => {
                if (scopes[i] === subscope) {
                    scope += " " + scopes.slice(0, i).join(" ")
                }
            })
        }

        return scope
    }


    /**
     * Generate new User into db and return credentials to use
     */
    newUser(req, res, next) {
        let user_key = randtoken.uid(64)
        let user_secret = randtoken.uid(64)
        let user = new this.users()

        // Save User w/ default values (+higher rate limit)
        user.user_id = 'unidentified-' + randtoken.uid(16)
        user.user_key = user_key
        user.user_secret = this.syncHash(user_secret)
        user.scope = 'basic-read'
        user.refresh_token = null
        user.last_ip = []
        user.save().then(user => {

            // Log IP
            this.saveIP(user_key, req.headers['x-forwarded-for'] || req.connection.remoteAddress, 'register', true)

            // Send Credentials to user
            return (res.status(200).json({
                user_key: user_key,
                user_secret: user_secret
            }))
        })
    }


    /**
     * Signs new Access Token
     */
    getAccessToken(data) {

        // JWT Options
        let options = {
            expiresIn: blitz.config.auth.exp,
            algorithm: blitz.config.auth.alg,
            issuer: blitz.config.auth.iss
        }

        return jwt.sign(data, blitz.config.auth.cert, options)
    }


    /**
     * Generate random Refresh Token & save in user doc
     */
    getRefreshToken(user_key) {

        // Generate Unique Token for Refresh
        // Token is composed of current time in ns + random 256bit token
        let refreshToken = process.hrtime().join("").toString() + randtoken.uid(256)

        // Save Refresh Token in DB
        this.users.findOneAndUpdate({
            'user_key': user_key
        }, {
            $set: {
                'refresh_token': refreshToken
            }
        }, {
            upsert: true
        })

        // Error Handling
        .catch((err) => {
            cli.log('Auth', 'err', err, 'out')
            return err
        })

        return refreshToken
    }


    /**
     * Logs most recent IPs for users
     */
    saveIP(user_key, ip, grant_type, authorized) {

        // Get length of existing logs
        this.users.findOne({
            'user_key': user_key
        })

        // Generate new array and save in db
        .then((user) => {
            if (user) {
                let arr_max = blitz.config.maxLogsPerUser
                let arr_new = []
                let arr_exs = user.last_ip

                // If arr max is reached: delete oldest
                if (arr_exs.length >= arr_max) arr_exs.pop()

                // Add Newest
                arr_exs.unshift({
                    ip: ip,
                    grant_type: grant_type,
                    success: authorized,
                    accessed: new Date().toISOString()
                })

                arr_new = arr_exs

                // Save new array to db
                this.users.findOneAndUpdate({
                    'user_key': user_key
                }, {
                    $set: {
                        'last_ip': arr_new
                    }
                }, {
                    upsert: true
                }).then()
            }
        })

        // Error Handling
        .catch(err => {
            return err
        })
    }


    /**
     * Sets up auth Schema
     */
    setSchema() {
        this.userSchema = this.db.Schema({
            user_id: String,
            user_key: String,
            user_secret: String,
            scope: String,
            refresh_token: String,
            last_ip: Array
        }, {
            collection: 'users'
        })
    }


    /**
     * Generates hash for user secret
     */
    syncHash(secret) {
        return bcrypt.hashSync(secret, bcrypt.genSaltSync(10), null)
    }


    /**
     * Compares Bcrypt hash w/ supplied secret
     */
    isValidSecret(secret, localhash) {
        return bcrypt.compareSync(secret, localhash)
    }


    /**
     * Sends error to web client
     */
    unauthorized(res, user_key, ip, grant_type) {

        // Log IP if provided
        if (user_key && ip) this.saveIP(user_key, ip, grant_type, false)
        return res.status(401).send("Unauthorized")
    }
}

module.exports = Authentication
