const chalk = require('chalk')

class Logger {
  constructor () {
    // Hierarchically ordered log levels
    this.levels = ['silly', 'verbose', 'info', 'monitor', 'silent']
    this.info = this.info
  }

  /**
   * Checks if log should proceed
   */
  includesLogLevel (level) {
    // Invalid Log Level
    if (!this.levels.includes(cubic.config.local.logLevel)) {
      return false
    }

    // Generate Array for every 'higher' log level to be included
    let i = this.levels.indexOf(cubic.config.local.logLevel)
    let enabled = this.levels.slice(i, this.levels.length)

    // Check if provided log level in enabled list
    return enabled.includes(level)
  }

  /**
   * Default log level. Logs limited information about the node status.
   */
  info (str) {
    if (this.includesLogLevel('info')) {
      console.log(str)
    }
  }

  /**
   * Error Log Level. Helpful for automated tests.
   */
  monitor (str, success, time) {
    if (this.includesLogLevel('monitor')) {
      let ok = success ? chalk.green('OK') : chalk.red('FAILED')
      let ms = chalk.grey(time)
      console.log(`:: ${ok} ${str} ${ms}`)
    }
  }

  /**
   * Verbose log level. Includes Request Timestamps, Socket Connections, Config events, etc
   */
  verbose (str) {
    if (this.includesLogLevel('verbose')) {
      console.log(chalk.grey(str))
    }
  }

  /**
   * Silly log level. Includes internal information on which routes are being bound, diagnostics and lifecycle details
   */
  silly (str) {
    if (this.includesLogLevel('silly')) {
      console.log(chalk.grey(str))
    }
  }
}

module.exports = Logger
