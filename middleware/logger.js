const chalk = require('chalk')

/**
 * Logger Middleware
 */
class Logger {
  constructor(config) {
    this.config = config
  }

  /**
   * Console logs complete output
   * @param {object} req - HTTP request object
   * @param {object} res - HTTP response object
   * @param {function} next - Next middleware function
   */
  log (req, res) {
    this.setPrefix(req)
    this.setUser(req)
    this.addTimer(req, res)
  }

  /**
   * Identify if request sent by Socket.io or Express
   * @param {object} req - HTTP request object
   */
  setPrefix (req) {
    if (req.channel === 'Sockets') {
      this.prefix = chalk.grey(`${this.config.prefix} | (ws) `)
    } else {
      this.prefix = chalk.grey(`${this.config.prefix} | (http) `)
    }
  }

  /**
   * Color-code user authentication
   * @param {object} req - HTTP request object
   */
  setUser (req) {
    this.user = {}

    if (req.user.scp) {
      this.user.uid = chalk.green(req.user.uid)
    } else {
      this.user.uid = req.user.uid
    }
  }

  /**
   * Add Timer to original res.send
   * @param {object} res - HTTP response object
   */
  addTimer (req, res) {
    let timestart = process.hrtime()
    let _json = res.json
    let _send = res.send
    let _this = this
    let prefix = this.prefix
    let log = ''

    res.send = res.json = function (body) {
      // Response Logic
      if (typeof body === 'object') {
        _json.call(this, body)
      } else {
        _send.call(this, body)

        // Log request
        log += `${_this.prefix}< ${_this.user.uid}: ${req.method} ${req.url}\n`

        // Log response
        let io = '> '
        if (res.statusCode.toString()[0] < 4) {
          io = chalk.green(io)
        } else {
          io = chalk.red(io)
        }
        if (body) {
          log += `${prefix}${io}${res.statusCode}: ${body.replace(/\r?\n|\r/g, ' ').slice(0, 100)}${body.length > 100 ? '...' : ''}\n`
        }

        // Log time
        let diff = process.hrtime(timestart)
        log += `${prefix}${chalk.grey(`> ${(diff[0] * 1e9 + diff[1]) / 1e6} ms`)}\n`
        blitz.log.info(log)
      }
    }
  }
}

module.exports = Logger
