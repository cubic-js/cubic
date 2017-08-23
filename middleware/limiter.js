/**
 * Redis Client for rate limiting
 */
const Redis = require("redis")
const client = Redis.createClient()


/**
 * Rolling Rate Limiting
 */
const RateLimiter = require("rolling-rate-limiter")

// Rate Limiter for privileged scope
const low_limit = RateLimiter({
    redis: client,
    namespace: "LowAccessLimit",
    interval: 5000,
    maxInInterval: 100
})

// Rate Limiter for registered users
const mid_limit = RateLimiter({
    redis: client,
    namespace: "MidAccessLimit",
    interval: 10000,
    maxInInterval: 30
})

// Rate Limiter for no tokens
const high_limit = RateLimiter({
    redis: client,
    namespace: "HighAccessLimit",
    interval: 10000,
    maxInInterval: 30
})


/**
 * Rolling Rate limiting Implementation
 */
 class Limiter {

     /**
      * Rolling Rate Limiting with Redis
      */
     check(req, res, next) {

         // No Token provided -> High limit, 1req/s
         if (!req.user.scp) {
             high_limit(req.user.uid, (err, timeLeft, actionsLeft) => this.limit(err, req, res, next, timeLeft, actionsLeft))
         }

         // User is root -> skip limiting
         else if (req.user.scp.includes("root") || req.user.scp.includes("ignore-rate-limit")) {
             return next()
         }

         // Token provided & privileged user -> No minDifference, 5req/s
         else if (req.user.scp.includes("elevated")) {
             low_limit(req.user.uid, (err, timeLeft, actionsLeft) => this.limit(err, req, res, next, timeLeft, actionsLeft))
         }

         // Token provided & default user -> Enhanced limits, 2req/s
         else if (req.user.scp.includes("basic")) {
             mid_limit(req.user.uid, (err, timeLeft, actionsLeft) => this.limit(err, req, res, next, timeLeft, actionsLeft))
         }

         else return next("Undocumented Authorization Scope. Please contact a developer on our discord server. https://discord.gg/8mCNvKp")
     }


     /**
      * Rate Limit error handling
      */
     limit(err, req, res, next, timeLeft, actionsLeft) {

         // Return any errors
         if (err) {
             return next(new Error("Uncaught Exception"))
         }

         // Limit Rate if necessary
         else if (timeLeft) {

             // Figure out why request got limited
             if (actionsLeft > 0) {
                 var err = {
                     error: "Rate limit exceeded.",
                     reason: `Request intervals too close. You need to wait ${timeLeft} ms to continue.`
                 }
             } else {
                 var err = {
                     error: "Rate limit exceeded.",
                     reason: `Max requests per interval reached. You need to wait ${timeLeft} ms to continue.`
                 }
             }

             // Figure out Source of Request
             if (req.channel === "Sockets") var prefix = "Sockets"
             else var prefix = "REST"

             // Respond with error
             return res.status(429).send(err)
         }

         // Otherwise allow
         else {
             return next()
         }
     }
 }


 module.exports = new Limiter()
