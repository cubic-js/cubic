const chalk = require('chalk')
const version = require('../package.json').version
const pkg = require(`${process.cwd()}/package.json`)

class Intro {
  constructor () {
    this.border = chalk.grey('---------------------------------------------------------------')
  }

  /**
   * Big Useless intro
   */
  roll () {
    console.log('\x1B[2J\x1B[0f\u001b[0;0H')
    console.log(' ')
    console.log(chalk.grey(`:: ${pkg.name} v.${pkg.version}`))
    console.log(chalk.grey(':: Launching Cubic stack...'))
    console.log(' ')
    console.log(chalk.grey('---------------------------------------------------------------'))
    console.log(' ')
    console.log(`
                            .M.
                        .MMMMMMMMM.
                     .MMMMMMMMMMMMMMM.
                 .MMMMMMMMMM\`  \`MMMMMMMMM.
              .MMMMMMMMM\`         \`MMMMMMMMM.
            MMMMMMMMM\`               \`MMMMMMMMM
            MMMMM\`                       \`MMMMM
            MMMMM          .M.            MMMMM
            MMMMM       .MMMMMMM          MMMMM
            MMMMM      MMMMMMMMMM         MMMMM
            MMMMM      MMMMMMM            MMMMM
            MMMMM      MMMMMM             MMMMM
            MMMMM        MMMM             MMMMM
            MMMMM          MM             MMMMM
            MMMMMM.                     .MMMMMM
            \`MMMMMMMMM.             .MMMMMMMMMM
               \`MMMMMMMMM:.       MMMMMMMMMM\`
                  \`MMMMMMMMMM     MMMMMM\`
                      \`MMMMMM
                         \`MMM     Cubic ${chalk.green(`v${version}`)}
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

module.exports = new Intro()
