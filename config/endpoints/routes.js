/**
 * HTTP Route Configuration
 */
module.exports = (http) => {

    /**
     * Accept all requests and have them handled by middleware/controllers
     */
    http.app.all('*', (req, res, next) => http.prepass(req, res, next))
}
