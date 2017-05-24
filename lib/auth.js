"use strict"

const request = require('request')

/**
 * Handles authorization on blitz auth-node and token handling via HTTP
 */
class Auth {

    constructor(options) {
        this.options = options
        this.authRetryCount = 0
    }


    /**
     * Get tokens for API authentication if credentials provided
     */
    authorize() {
        return new Promise((resolve, reject) => {

            // Credentials provided
            if (this.options.user_key && this.options.user_secret) {
                this.getToken().then(() => resolve())
            }

            // No Authentication
            else {
                resolve()
            }
        })
    }


    /**
     * Get Token via http on /auth
     */
    getToken() {
        return new Promise((resolve, reject) => {

            // Set authentication options
            let auth_request = {
                user_key: this.options.user_key,
                user_secret: this.options.user_secret
            }

            // Post Options
            let post_options = {
                method: 'post',
                body: auth_request,
                json: true
            }

            // Send to /auth endpoint
            request(this.options.auth_url + 'token', post_options, (err, res) => {
                if (res) {

                    // User authenticated
                    if(res.statusCode === 200 || res.statusCode === 304) {
                        this.access_token = res.body.access_token
                        this.refresh_token = res.body.refresh_token
                        this.authRetryCount = 0
                        resolve()
                    }

                    // User not authenticated
                    else {
                        if (this.authRetryCount <= 5) this.getToken(this.options.user_key, this.options.user_secret).then(() => resolve())
                        else reject(new Error("blitz-query client could not authenticate after 5 attempts."))
                        ++this.authRetryCount
                    }
                }

                // Retry if no response
                else {
                    setTimeout(() => {
                        this.getToken(user_key, user_secret).then(() => resolve())
                    }, 50)
                }
            })
        })
    }


    /**
     * Get new access token from refresh_token & save in object
     */
    refreshToken(retry) {
        return new Promise((resolve, reject) => {

            // Ensure only one refresh process is done at a time
            if (!this.refreshing || retry) {
                this.refreshing = true

                // Set authentication options
                let auth_request = {
                    refresh_token: this.refresh_token
                }

                // Post Options
                let post_options = {
                    method: 'post',
                    body: auth_request,
                    json: true
                }

                // Send to /auth endpoint
                request(this.options.auth_url + 'token', post_options, (err, res) => {
                    if (res) {
                        this.access_token = res.body.access_token
                        this.refreshing = false
                        resolve()
                    }

                    // Retry if no response
                    else {
                        setTimeout(() => {
                            this.refreshToken(true).then(() => resolve())
                        }, 50)
                    }
                })
            }

            // Already refreshing? -> Add to queue
            else resolve()
        })
    }
}

module.exports = Auth
