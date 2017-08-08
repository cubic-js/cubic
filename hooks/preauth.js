const mongodb = require("mongodb").MongoClient
const bcrypt = require('bcrypt-as-promised')
const mongoVerifySingleIndex = (db, col, index) => {
    // Verify index
    db.collection(col).createIndex(index)

    // Verbose log string
    let str = "Auth      | verified "

    // Get obj length
    let objLength = Object.keys(index).map(key => index.hasOwnProperty(key)).length

    // Append possible compound
    if (objLength > 1) {
        str += "compound "
    }

    // Append names
    let i = 0
    for (let key in index) {
        if (index.hasOwnProperty(key)) {
            str += key
            if (i < objLength - 1) str += "/"
            i++
        }
    }

    // Log
    str += " index"
    blitz.log.silly(str)
}

/**
 * Pre-Auth Class used for establishing connections to auth core node
 * Note: the middleware function must be complete, meaning no references to
 * any values outside of its own scope. We'll run that function on a whole
 * different process.
 */
class PreAuth {

    /**
     * Set mongo indices to optimize queries for user_key and refresh tokens
     */
    async verifyIndices() {
        let db = await mongodb.connect(blitz.config[blitz.id].mongoURL)
        blitz.log.verbose("Auth      | verifying user indices")
        mongoVerifySingleIndex(db, 'users', {'refresh_token': 1})
        mongoVerifySingleIndex(db, 'users', {'user_key': 1})
    }


    /**
     * Create dev user with root permission so users don't have to manually
     * import users first. This function will be hooked.
     */
    async manageDevUser() {
        let db = await mongodb.connect(blitz.config[blitz.id].mongoURL)

        // Create dev user if it doesn't exist
        if (blitz.config.local.environment === "development") {
            blitz.log.verbose("Auth      | Ensuring dev user. Do not use this in production.")
            db.collection("users").updateOne({
                user_key: "dev"
            }, {
                $set: {
                    user_key: "dev",
                    user_secret: await bcrypt.hash("dev"),
                    user_id: "dev-node",
                    last_ip: [],
                    scope: "root-read-write",
                    refresh_token: "dev-token"
                }
            }, {
                upsert: true
            })
        }

        // Remove dev user in production
        else {
            db.collection("users").remove({
                user_key: "dev"
            })
        }
    }

    /**
     * Validate workers via private key verification. (Normal authentication is
     * done on the workers themselves, so we need a way to authorize beforehand)
     * For validation we send a random value and have it signed with the
     * private key to verify authenticity
     */
    validateWorker() {
        return blitz.nodes.auth_api.post("/token", async (req, res, next) => {

            // Load JWT inside function because it's used in another process
            const jwt = require("jsonwebtoken")
            const mongodb = require("mongodb").MongoClient
            let db = await mongodb.connect(blitz.config[blitz.id].mongoURL)

            // Core-node attempts to connect
            if (req.body && req.body.user_key && req.body.user_key.includes("VerifyBySignature")) {

                // Payload is signed with private key
                try {
                    let payload = jwt.verify(req.body.user_secret, blitz.config[blitz.id].certPublic)

                    // Explicitly authorized (isn't a key in generic JWTs)
                    if (payload.authorized) {

                        // Fetch Refresh token
                        let user_key = req.body.user_key.replace("-VerifyBySignature", "")
                        let user = await db.collection("users").findOne({user_key: user_key})

                        // Generate Tokens
                        let access_token = jwt.sign({
                            scp: user.scope,
                            uid: user.user_id
                        }, blitz.config.auth.certPrivate, {
                            algorithm: blitz.config[blitz.id].alg,
                            issuer: blitz.config[blitz.id].iss
                        })
                        let refresh_token = user.refresh_token

                        // Respond to client
                        return res.status(200).json({
                            access_token: access_token,
                            refresh_token: refresh_token
                        })
                    }

                    // Not authorized
                    else {
                        throw ("Unauthorized")
                    }
                }

                // Invalid Token
                catch (err) {
                    return res.status(401).json({
                        error: "Unauthorized",
                        reason: "Hey there, we like your commitment! Mail us at devs@nexus-stats.com if you wanna work with us."
                    })
                }
            }

            // Normal Authentication attempt
            else {
                next()
            }
        })
    }
}

module.exports = new PreAuth
