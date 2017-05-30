/**
 * HTTP Route Configuration
 */
module.exports = (http) => {

    /**
     * Render API Documentation on index
     */
    http.app.all('*', (req, res, next) => http.prepass(req, res, next))

    /**
     * Other Routes are created dynamically via events.js config
     */
}
