/**
 * HTTP Route Configuration
 */

module.exports = (app, auth) => {

    /**
     * Authentication endpoint to receive authorization token
     */
    app.post('/auth', (req, res, next) => {

        // Credentials sent
        if (req.body.user_key){
            auth.matchCredentials(req, res, next)
        } else

        // Refresh Token sent
        if (req.body.refresh_token){
            auth.matchRefreshToken(req, res, next)
        } else

        // No Allowed content
        {
            cli.log('Auth', 'ok', req.ip + ': ' + JSON.stringify(req.body), 'in')
            auth.unauthorized(res)
        }
    })

    app.get('/register', (req, res, next) => {
        auth.newUser(req, res, next)
    })
}
