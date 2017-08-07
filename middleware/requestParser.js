/**
 * Converts standard URL string into JSON object usable by core nodes
 */
class RequestParser {

    /**
     * Convert URL into JSON
     */
    parse(req, res, next) {

        // Proper request format?
        if (typeof req.url === 'string' || req.url instanceof String) {
            this.process(req, res, next)
        }

        // Improper request format
        else {
            next("Invalid Request Format. Please provide a URL string.")
        }
    }


    /**
     * Actual Parsing Logic
     */
    process(req, res, next) {
        let url = req.url

        // Clean up
        url = url.split("%20").join(" ")
        url = url.replace("https://", "")
        url = url.replace("http://", "")

        // Slice sub-categories
        url = url.split("/")

        // Build up req object
        this.getQuery(req, url)

        // Remove already-assigned data
        url.pop()
        url.splice(0, 3)

        // Assign Resource Path
        req.resource = url
        next()
    }


    /**
     * Get Method & params from rest of URL
     */
    getQuery(req, url) {
        let query = url[url.length - 1].split("?")
        req.endpoint = query[0]
        url.splice(-1, 1)
        req.route = url.join("/") + "/" + req.endpoint
        req.query = {}

        // Get Query from rest of query string
        if (query.length > 1) {
            query.splice(0, 1)
            query = query[0].split("&")

            // Assign left/right value of param to individual key
            for (var i = 0; i < query.length; i++) {
                let val = query[i].split("=")
                req.query[val[0]] = val[1]
            }
        }
    }
}

module.exports = new RequestParser()
