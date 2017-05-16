/**
 * Dependencies
 */
const redis = require("redis")


class CacheController {

    /**
     * Connect to db 1 which is used for caching
     */
    constructor() {
        this.client = redis.createClient()
        this.client.select(blitz.config.api.cacheDB)
    }


    /**
     * Saves string as key value
     */
    save(key, value, exp) {
        value = typeof value === "object" ? JSON.stringify(value) : value
        this.client.setex(key, exp || blitz.config.api.cacheExp, value)
    }


    /**
     * Middleware function. Respond if data present, Next if not
     */
    check(req, res, next) {
        this.get(req.url).then(data => data ? res.send(data) : next())
    }


    /**
     * Get Data from cache. If not present, have it calculated
     */
    get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, res) => {
                if (res) resolve(res)
                else resolve(null)
            })
        })
    }
}

module.exports = new CacheController()
