/**
 * HTTP Route Configuration
 */

module.exports = (app, auth) => {

    /**
     * Authentication endpoint to receive authorization token
     */
    app.post('/token', (req, res, next) => {

        // Credentials sent
        if (req.body.user_key){
            auth.matchCredentials(req, res, next)
        }

        // Refresh Token sent
        else if (req.body.refresh_token){
            auth.matchRefreshToken(req, res, next)
        }

        // No Allowed content
        else {
            auth.unauthorized(res)
        }
    })

    app.get('/register', (req, res, next) => {
        auth.newUser(req, res, next)
    })
}
