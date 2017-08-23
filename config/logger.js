'use strict'

const chalk = require('chalk')

class Log {
  constructor () {
    // Hierarchically ordered log levels
    this.levels = ['silly', 'verbose', 'info', 'monitor']
    this.info = this.info
    this.path = __filename // used to initialize on other workers
  }

  /**
   * Checks if log should proceed
   */
  includesLogLevel (level) {
    // Invalid Log Level
    if (!this.levels.includes(blitz.config.local.logLevel)) {
      return false
    }

    // Generate Array for every 'higher' log level to be included
    let i = this.levels.indexOf(blitz.config.local.logLevel)
    let enabled = this.levels.slice(i, this.levels.length)

    // Check if provided log level in enabled list
    return !!enabled.includes(level)
  }

  /**
   * Default log level. Logs limited information about the node status.
   */
  info (str) {
    if (this.includesLogLevel('info')) {
      console.log(chalk.grey(this.getPrefix()) + str)
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
      console.log(chalk.grey(this.getPrefix() + str))
    }
  }

  /**
   * Silly log level. Includes internal information on which routes are being bound, diagnostics and lifecycle details
   */
  silly (str) {
    if (this.includesLogLevel('silly')) {
      console.log(chalk.grey(this.getPrefix() + str))
    }
  }

  /**
   * Generate Prefix for caller, so everything is in the same vertical line
   */
  getPrefix () {
    let prefix = process.pid
    let max = 5 - prefix.toString().length

    // Fill up 15 chars in width
    for (let i = 0; i < max; i++) {
      prefix += ' '
    }
    prefix += '  |  '
    return prefix
  }
}

module.exports = Log
