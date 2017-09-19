/**
 * Dependencies
 */
const chalk = require("chalk")
const version = require('./package.json').version
const pkg = require(`${process.cwd()}/package.json`)

/**
 * Main Logger class. Used for interface fluff & Sentry.io
 */
class Logger {

  constructor() {
    console.log('\x1B[2J\x1B[0f\u001b[0;0H')
    this.intro()
    this.border = chalk.grey("---------------------------------------------------------------")
  }

  /**
   * Big Useless intro
   */
  intro() {
    console.log(" ")
    console.log(chalk.grey(`:: ${pkg.name} v.${pkg.version}`))
    console.log(chalk.grey(":: Launching Blitz.js stack..."))
    console.log(" ")
    console.log(chalk.grey("---------------------------------------------------------------"))
    console.log(" ")
    console.log(`
                            ..
                            :Ndo-
                             .dMMms:
                               sMMMMNh:.
                                /NMMMMMMdo.
                                 .mMMMMMMMMd.
                 /:-..            \`yMMMMMMMM/
                \`MMMMMMNmdys+-      /MMMMMMM/
                \`MMNNMMMMMms:        -mMMMMM/
                \`MMMh  .:\`            \`yMMMM/
                \`MMMMm.            \`:. .sMMM/
                \`MMMMMN.        -odMMMMMMNMM/
                \`MMMMMMMs      .:oyhdNMMMMMM/
                \`MMMMMMMMd.            \`.-::.
                 :MMMMMMMMN:
                  \`:hNMMMMMMs
                     \`:sNMMMMd.      Blitz.js
                         -odMMN:     ${chalk.green(`v.${version}`)}
                            \`+hNo
                                \`
                         `)
    console.log(" ")
    console.log(" ")
    console.log(chalk.grey(":: " + new Date()))
    console.log(":: Environment : " + blitz.config.local.environment)
    console.log(":: LogLevel    : " + blitz.config.local.logLevel)
    console.log(chalk.grey("---------------------------------------------------------------"))
    console.log(" ")
  }
}

module.exports = new Logger()
