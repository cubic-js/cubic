const request = require('request')
const io = require('socket.io-client')

class Http {

    constructor(auth_options, resolve, reject) {

        let options = {
            auth: {
                'bearer': auth_options.token
            }
        }

        // Set defaults with supplied options
        request.defaults(options)

        resolve()
    }


    /**
     * Send method, requests target endpoint, resolves promise with response
     */
    send(method, query, resolve, reject) {
        let params = '?'
        let counter = 0
        for(let param_key in query.params){
            params += param_key + '=' + query.params[param_key]
            if(counter < Object.keys(query.params).length){
                params += '&'
            }
            counter++
        }

        // Request Options
        let req_options = {
            method: method,
            url: 'http://localhost:3400/' + query.resource + '/' + query.query + params
        }

        request(req_options, (err, res) => {
            resolve(res.body)
        })
    }
}

module.exports = Http
