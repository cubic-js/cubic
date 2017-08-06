const request = require('request-promise')
const timeout = (fn, s) => {
    return new Promise(resolve => setTimeout(() => resolve(fn()), s))
}

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
    async authorize() {
        if (this.options.user_key && this.options.user_secret) {
            return this.getToken()
        }
    }


    /**
     * Refresh tokens if possible
     */
    async reauthorize() {
        if (this.options.user_key && this.options.user_secret) {
            return this.refreshToken()
        }
    }


    /**
     * Get Token via http on /auth
     */
    async getToken() {

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

        try {
            let res = await request(this.options.auth_url + '/token', post_options)
            this.access_token = res.access_token
            this.refresh_token = res.refresh_token
        }
        catch(err) {
            await timeout(() => this.getToken(this.options.user_key, this.options.user_secret), 1000)
        }
    }


    /**
     * Get new access token from refresh_token & save in object
     */
    async refreshToken() {

        // Ensure only one refresh process is done at a time
        if (!this.refreshing) {
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
            try {
                let res = await request(this.options.auth_url + '/token', post_options)
                this.access_token = res.access_token
                this.refreshing = false
            }
            catch(err) {
                this.refreshing = false
                await timeout(() => this.refreshToken(), 1000)
            }
        }
    }
}

module.exports = Auth
