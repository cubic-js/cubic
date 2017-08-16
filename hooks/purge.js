const mongodb = require("mongodb").MongoClient

/**
 * Remove unused users to reduce unnecessary storage usage (production only)
 */
class Purge {
    async purgeInactiveUsers() {
        if (blitz.config.local.environment === "production" && blitz.config[blitz.id].purgeMaxLimit > 0) {
            let db = await mongodb.connect(blitz.config[blitz.id].mongoURL)
            setInterval(() => {
                let limit = new Date() - blitz.config[blitz.id].purgeMaxLimit
                db.collection("users").remove({
                    "last_ip.0.accessed": {
                        $lt: limit
                    }
                })
            }, blitz.config[blitz.id].purgeInterval)
        }
    }
}

module.exports = new Purge
