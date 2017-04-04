/**
 * Token based authentication using JWT & Passport
 */

/**
 * Connect to mongodb
 */
const db = require('mongoose').connect(process.env.mongo_url)
db.Promise = global.Promise;


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
 * Describes interactions with mongo/redis for auth
 */
class Authentication {

    constructor() {

        this.setSchema()

        this.users = db.model('User', this.userSchema)
    }


    /**
     * Check supplied user info & send token
     */
    matchCredentials(req, res, next) {

        cli.log('Auth', 'ok', req.ip + ': ' + JSON.stringify('user_key: ' + req.body.user_key), 'in')

        // find user in db
        this.users.findOne({
            user_key: req.body.user_key
        })

        .then((user) => {

            // No User Found
            if (!user) {
                this.unauthorized(res, req.body.user_key, req.ip, 'credentials');
            } else

            // Password Mismatch
            if (!this.isValidSecret(req.body.user_secret, user.user_secret)) {
                this.unauthorized(res, req.body.user_key, req.ip, 'credentials');
            } else {

                // Valid User Found
                this.saveIP(user.user_key, req.ip, 'credentials', true)

                // Set Options
                let data = {
                    scp: user.scope,
                    uid: user.user_id,
                }

                // Get Tokens
                let accessToken = this.getAccessToken(data)
                let refreshToken = this.getRefreshToken(user.user_key)

                cli.log('Auth', 'ok', '<JWT>', 'out')

                return res.json({
                    access_token: accessToken,
                    refresh_token: refreshToken
                })
            }
        })

        .catch((err) => {
            cli.log('Auth', 'err', err, 'out')
            this.unauthorized(res, req.body.user_key, req.ip, 'credentials')
        })
    }


    /**
     * Validates Refresh token, sends new access token
     */
    matchRefreshToken(req, res, next) {

        cli.log('Auth', 'ok', req.ip + ': <refresh>', 'in')

        // Find refresh token in db
        this.users.findOne({
            refresh_token: req.body.refresh_token
        })

        .then((user) => {

            // No Refresh Token found
            if (!user) {
                this.unauthorized(res)
            }

            // Valid User Found > Send token
            else {
                let data = {
                    scp: user.scope,
                    uid: user.user_id,
                }

                // Get Tokens
                let accessToken = this.getAccessToken(data)

                // Save IP
                this.saveIP(user.user_key, req.ip, 'refresh_token', true)

                cli.log('Auth', 'ok', '<JWT>', 'out')
                return res.status(200).json({
                    access_token: accessToken
                })
            }
        })

        .catch((err) => {
            cli.log('Auth', 'err', err, 'out')
            return err
        })
    }


    /**
     * Generate new User into db and return credentials to use
     */
    newUser(req, res, next) {
        let user_key = randtoken.uid(64)
        let user_secret = randtoken.uid(64)
        let user = new this.users()

        cli.log('Auth', 'ok', req.ip + ': register', 'in')

        // Save User w/ default values (+higher rate limit)
        user.user_id = 'unidentified-' + randtoken.uid(16)
        user.user_key = user_key
        user.user_secret = this.syncHash(user_secret)
        user.scope = 'default'
        user.refresh_token = null
        user.last_ip = []
        user.save().then((user) => {

            // Log IP
            this.saveIP(user_key, req.ip, 'register', true)
            cli.log('Auth', 'ok', 'New user. ID: ' + user.user_id, 'out')

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
            expiresIn: '10s',
            algorithm: 'RS256',
            issuer: process.env.iss
        }

        return jwt.sign(data, process.env.cert, options);
    }


    /**
     * Generate random Refresh Token & save in user doc
     */
    getRefreshToken(user_key) {

        // Generate Random Token for Refresh
        let refreshToken = randtoken.uid(256)

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
                let arr_max = 5
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
        .catch((err) => {
            cli.log('Auth', 'err', err, 'out')
            return err
        })
    }


    /**
     * Sets up auth Schema
     */
    setSchema() {
        this.userSchema = db.Schema({
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

        cli.log('Auth', 'err', '401. Unauthorized.', 'out')

        // Log IP if provided
        if (user_key && ip) this.saveIP(user_key, ip, grant_type, false)

        // Throttle spammers
        setTimeout(() => {
            return res.status(401).json({
                status: 'error',
                code: 'unauthorized',
                message: 'credentials mismatch or token expired'
            })
        }, 3000)
    }
}

module.exports = new Authentication()
