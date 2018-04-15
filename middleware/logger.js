const chalk = require('chalk')

/**
 * Logger Middleware
 */
class Logger {
  /**
   * Console logs complete output
   * @param {object} req - HTTP request object
   * @param {object} res - HTTP response object
   * @param {function} next - Next middleware function
   */
  log (req, res, next) {
    // Prepare output
    this.setPrefix(req)
    this.setUser(req)
    this.logErr(next)
    this.logRes(res)
    this.addTimer(res)

    // Actual Console Output
    blitz.log.info(`${this.prefix}< ${this.user.uid}: ${req.method} ${req.url}`)
    next()
  }

  /**
   * Identify if request sent by Socket.io or Express
   * @param {object} req - HTTP request object
   */
  setPrefix (req) {
    if (req.channel === 'Sockets') {
      this.prefix = chalk.grey('Socket.io | ')
    } else {
      this.prefix = chalk.grey('HTTPS     | ')
    }
  }

  /**
   * Color-code user authentication
   * @param {object} req - HTTP request object
   */
  setUser (req) {
    this.user = {}

    if (req.user.scp.includes('basic')) {
      this.user.uid = req.user.uid
    } else {
      this.user.uid = chalk.green(req.user.uid)
    }
  }

  /**
   * Log any errors passed to next()
   * @param {function} next - Next middleware function
   */
  logErr (next) {
    let _next = next
    next = (err) => {
      _next(err)
      if (err) {
        blitz.log.info(this.prefix + chalk.red('> ') + err)
      }
    }
  }

  /**
   * Log Output of res.send
   * @param {object} res - HTTP response object
   */
  logRes (res) {
    let _send = res.send
    let prefix = this.prefix

    res.send = function (body) {
      _send.call(this, body)

      // Output is error? (4xx/5xx/etc)
      let io = '> '
      if (res.statusCode.toString()[0] < 4) {
        io = chalk.green(io)
      } else {
        io = chalk.red(io)
      }

      if (body) {
        blitz.log.info(prefix + io + res.statusCode + ': ' + body.replace(/\r?\n|\r/g, ' ').slice(0, 100) + (body.length > 100 ? '...' : ''))
      }
    }
  }

  /**
   * Add Timer to original res.send
   * @param {object} res - HTTP response object
   */
  addTimer (res) {
    let timestart = process.hrtime()
    let _json = res.json
    let _send = res.send
    let prefix = this.prefix

    res.send = function (body) {
      // Response Logic
      if (typeof body === 'object') {
        _json.call(this, body)
      } else {
        _send.call(this, body)

        // Time Logging
        let diff = process.hrtime(timestart)
        blitz.log.info(prefix + chalk.grey(`> ${(diff[0] * 1e9 + diff[1]) / 1e6} ms`))
        blitz.log.info(' ')
      }
    }
  }
}

module.exports = new Logger()
