"use strict";

/**
 * Helper class to Convert Socket.io requests into res-like objects. This allows uniform pre-pass middleware.
 */
class Converter {

    /**
     * Convert Socket.io request into req-like object
     */
    convertReq(request, socket, verb) {
        if(request) {
            let req = {}
            let url = verb === "GET" ? request : request.url

            req.body = request.body
            req.url = url
            req.user = socket.user
            req.method = verb
            req.channel = "Sockets"
            return req
        } else {
            return {}
        }
    }


    /**
     * Convert Socket.io ack callback into res-like object
     */
    convertRes(socket, ack) {

        // Default response value
        let res = {
            statusCode: 200,
            body: "<empty>"
        }

        // Socket.io ack passed?
        if (ack) {

            // Send method, invoking client callback with previously customized data
            res.send = (data) => {
                if (!res.sent) {
                    res.sent = true
                    res.body = data
                    ack(res)
                } else {
                    // Multi request. No errors will occur but this shouldn't happen
                }
            }

            // Apply Status before res.send
            res.status = (code) => {
                res.statusCode = code
                return res
            }

            // Pseudo res.json to stay parallel with express
            res.json = (data) => {
                data = JSON.stringify(data)
                return res.send(data)
            }
        }

        // Non-ack request
        else {

            // Simple socket emit
            res.send = (data) => {
                res.body = data
                socket.emit("res", res.msg)
            }

            // Apply Status before res.send
            res.status = (code) => {
                res.statusCode = code
                return res
            }

            // Pseudo res.json to stay parallel with express
            res.json = (data) => {
                data = JSON.stringify(data)
                return res.send(data)
            }
        }

        // Modified res object
        return res
    }
}

module.exports = new Converter()
