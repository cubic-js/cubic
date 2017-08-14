const redis = require("redis")
const mime = require("mime")

class CacheController {

    /**
     * Connect to db 1 which is used for caching
     */
    constructor() {
        this.client = redis.createClient()
        this.client.select(blitz.config[blitz.id].cacheDB)
    }


    /**
     * Saves string as key value
     */
    save(key, value, exp = 0) {
        value = typeof value === "object" ? JSON.stringify(value) : value
        key = key.toLowerCase().split(" ").join("%20")
        blitz.log.verbose("API       | < caching data for " + key)
        this.client.setex(key, exp || blitz.config[blitz.id].cacheExp, value)
    }


    /**
     * Middleware function. Respond if data present, Next if not
     */
    async check(req, res, next) {
        let data = await this.get(req.url)
        let url = req.url.split("/")

        // Is cached
        if (data) {
            if (url[url.length - 1].split(".")[1]) {
                let bufferData = new Buffer(data.body, "base64")
                res.header("content-type", mime.lookup(req.url))
                res.end(bufferData)
            } else {
                if (data.type === "json") {
                    res.json(data)
                } else {
                    res.send(data.body)
                }
            }
        }

        // Not cached
        else {
            next()
        }
    }


    /**
     * Get Data from cache. If not present, have it calculated
     */
    get(key) {
        return new Promise((resolve, reject) => {
            key = key.toLowerCase().split(" ").join("%20")
            this.client.get(key, (err, res) => {
                if (res) {
                    try {
                        res = {
                            body: JSON.parse(res),
                            type: "json"
                        }
                    }
                    catch(e) {

                    }
                    finally {
                        blitz.log.verbose("API       | > returning cached data " + key)
                        resolve(res)
                    }
                }
                else resolve(null)
            })
        })
    }
}

module.exports = CacheController
