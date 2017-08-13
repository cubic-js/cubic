const Request = require("../../controllers/request.js")
const Layer = require("../layers.js")

/**
 * Class describing connection adapter / Request Handler for different channel
 */
class Adapter {
    constructor(port) {

        // Create empty adapter middleware stack
        this.stack = []

        // Bind Request Controller to object
        this.request = new Request()
    }


    /**
     * Functions to run before allowing request
     */
    async prepass(req, res) {
        const layer = new Layer
        await layer.runStack(req, res, this.stack)
        this.pass(req, res)
    }


    /**
     * Passes request to RequestController
     */
    async pass(req, res) {
        let response = await this.request.getResponse(req)
        res.status(response.statusCode)[response.method](response.body)
    }


    /**
     * Accepts middleware to run before this.pass()
     */
    use(route, fn, verb) {
        let middleware = {
            method: verb ? verb : "ANY",
            route: typeof route === "string" ? route : "*", // check if includes. Maybe need reverse order for reading?
            fn: typeof fn === "function" ? fn : route
        }
        this.stack.unshift(middleware)
    }
}

module.exports = Adapter
