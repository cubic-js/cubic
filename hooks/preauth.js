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
        mongoVerifySingleIndex(db, 'users', {
            'refresh_token': 1
        })
        mongoVerifySingleIndex(db, 'users', {
            'user_key': 1
        })
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
     * Set up manual endpoint for auth worker to authenticate against
     */
    validateWorker() {
        blitz.nodes.auth_api.post("/token", async(req, res, next) => {

            // Load dependencies inside function because it's used in another process
            const jwt = require("jsonwebtoken")
            const bcrypt = require("bcrypt-as-promised")
            const randtoken = require("rand-token")
            const mongodb = require("mongodb").MongoClient
            const db = await mongodb.connect(blitz.config[blitz.id].mongoURL)

            // Core-node attempts to connect
            if (req.body && req.body.user_key && req.body.user_key.includes("-VerifyAuthWorker")) {
                let user = await db.collection("users").findOne({
                    user_key: req.body.user_key.replace("-VerifyAuthWorker", "")
                })

                // Check if secret matches
                if (await bcrypt.compare(req.body.user_secret, user.user_secret)) {
                    let refresh_token
                    let access_token = jwt.sign({
                        scp: user.scope,
                        uid: user.user_id
                    }, blitz.config.auth.certPrivate, {
                        algorithm: blitz.config.auth.alg
                    })

                    if (user.refresh_token) {
                        refresh_token = user.refresh_token
                    } else {
                        refresh_token = user.user_key + randtoken.uid(256)

                        // Save Refresh Token in DB
                        await db.collection("users").updateOne({
                            'user_key': user.user_key
                        }, {
                            $set: {
                                'refresh_token': refresh_token
                            }
                        }, {
                            upsert: true
                        })
                    }

                    // Send back tokens
                    return res.json({
                        access_token: access_token,
                        refresh_token: refresh_token
                    })
                }

                // Password not matching
                else {
                    next()
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
