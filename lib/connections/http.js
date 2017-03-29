const io = require('socket.io-client')
const request = require('request')

class Http {

    constructor(){
        this.request = request
    }

    /**
     * Sets new settings for http requests
     */
    config(auth_options, resolve, reject) {
        // Credentials provided?
        if (auth_options) {

            // Set defaults with supplied options
            this.request = this.request.defaults({
                headers: {
                    'authorization': 'bearer ' + auth_options.token,
                    'user-agent': 'node-nexus-api/0.0.1'
                }
            })
        } else {
            this.request = this.request.defaults({
                headers: {
                    'user-agent': 'node-nexus-api/0.0.1'
                }
            })
        }

        resolve()
    }


    /**
     * Send method, requests target endpoint, resolves promise with response
     */
    send(method, query) {
        return new Promise((resolve, reject) => {

            // Request Options
            let req_options = {
                method: method,
                url: query
            }

            this.request(req_options, (err, res) => {
                resolve(res)
            })
        })
    }
}

module.exports = new Http()
