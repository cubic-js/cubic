const Transformer = require('../transformers/ws.js')
const transformer = new Transformer()
const Middleware = require('../../middleware/native/ws.js')

class WsListener {
  constructor (config, adapter) {
    this.config = config
    this.adapter = adapter
    this.middleware = new Middleware(this.config)
    this.nodeIds = 1
  }

  default (spark) {
    const { user } = spark.request
    user.isRoot = () => user.scp.includes('write_root')
    const RESTful = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

    spark.on('data', data => {
      if (!data) return
      const { action, room } = data

      // RESTful requests - Pass to core node
      if (RESTful.includes(action)) {
        this.pass(spark, action, data)
      }

      // Pub/Sub
      else if (action === 'SUBSCRIBE') spark.join(room)
      else if (action === 'UNSUBSCRIBE') spark.leave(room)
    })

    spark.on('error', err => this.log(`${user.uid} err: ${err}`))
    spark.on('end', () => this.log(`${user.uid} disconnected.`))
  }

  /**
   * Pass request to endpoint.
   */
  pass (spark, method, request) {
    const req = transformer.convertReq(request, spark, method)
    const res = transformer.convertRes(spark, request)

    if (res) {
      const verified = this.middleware.verifyToken(req, res)
      if (verified) this.adapter.runMiddleware(req, res)
    } else {
      spark.write({
        statusCode: 400,
        body: {
          error: 'Missing request id.',
          reason: 'Please add an id like { action: "GET", url: "/foo", id: 1 }. You won\'t be able to tell which response belongs to which request otherwise.'
        } })
    }
  }

  log (msg) {
    cubic.log.verbose(`${this.config.prefix} | (ws) ${msg}`)
  }
}

module.exports = WsListener
