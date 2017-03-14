const io = require('socket.io-client')
let request = require('request')

class Http {

    constructor(auth_options, resolve, reject) {

        // Set defaults with supplied options
        request = request.defaults({
            headers: {
                'authorization': 'bearer ' + auth_options.token,
                'user-agent': auth_options.ua
            }
        })

        resolve()
    }


    /**
     * Send method, requests target endpoint, resolves promise with response
     */
    send(method, query, resolve, reject) {
        let params = '?'
        let counter = 0
        for (let param_key in query.params) {
            params += param_key + '=' + query.params[param_key]
            if (counter < Object.keys(query.params).length) {
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
