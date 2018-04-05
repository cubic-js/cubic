/**
 * Dependencies
 */
const chalk = require('chalk')
const version = require('./package.json').version
const pkg = require(`${process.cwd()}/package.json`)

/**
 * Main Logger class. Used for interface fluff & Sentry.io
 */
class Intro {

  constructor() {
    this.border = chalk.grey('---------------------------------------------------------------')
  }

  /**
   * Big Useless intro
   */
  roll() {
    console.log('\x1B[2J\x1B[0f\u001b[0;0H')
    console.log(' ')
    console.log(chalk.grey(`:: ${pkg.name} v.${pkg.version}`))
    console.log(chalk.grey(':: Launching cubic stack...'))
    console.log(' ')
    console.log(chalk.grey('---------------------------------------------------------------'))
    console.log(' ')
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
                     \`:sNMMMMd.      cubic
                         -odMMN:     ${chalk.green(`v.${version}`)}
                            \`+hNo
                                \`
                         `)
    console.log(' ')
    console.log(' ')
    console.log(chalk.grey(':: ' + new Date()))
    console.log(':: Environment : ' + cubic.config.local.environment)
    console.log(':: LogLevel    : ' + cubic.config.local.logLevel)
    console.log(chalk.grey('---------------------------------------------------------------'))
    console.log(' ')
  }
}

module.exports = new Intro
