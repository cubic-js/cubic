const webpack = require('webpack')
const fs = require('fs')
const promisify = require('util').promisify
const writeFile = promisify(fs.writeFile)
const mkdirp = require('mkdirp')
const path = require('path')

class WebpackServer {
  constructor () {
    this.config = {
      client: require(cubic.config.ui.webpack.clientConfig),
      server: require(cubic.config.ui.webpack.serverConfig)
    }
    this.init()
  }

  /**
   * Entrypoint for hook on cubic-core
   */
  async init () {
    if (!cubic.config.ui.webpack.skipBuild) {
      await this.registerEndpoints()
      await this.initBuild()
    }
  }

  /**
   * Register routes in vue-router file. It can't be done in runtime, so
   * we gotta ensure the file is ready before rendering anything.
   */
  async registerEndpoints () {
    const routes = await this.getViewConstants()
    let routeOutput = `/**
                    * Auto-generated routes from cubic view node. We can't
                    * get them at runtime, so we need to save them like a config
                    * file pre-build.
                    */
                    export default ${JSON.stringify(routes, null, 2)}
                    `

    // Lazy cleanup for stringified functions
    /* eslint no-useless-escape: "off" */
    routeOutput = routeOutput.replace(/"\(\) \=\>/g, '() =>').replace(/`\)"/g, '`)')

    // Save to file
    await writeFile(path.join(__dirname, '../vue/router/routes.js'), routeOutput)
  }

  /**
   * Generate plaintext constants which will be saved in the router file
   */
  async getViewConstants () {
    const srcDir = cubic.config.ui.sourcePath.replace(/\\/g, '/')
    const endpoints = cubic.nodes.ui.core.client.endpointController.endpoints
    let routes = []

    endpoints.forEach(endpoint => {
      let route = {
        path: endpoint.route,
        component: `() => import(\`${srcDir}/${endpoint.view}\`)`,
        props: true
      }
      routes.push(route)
    })

    return routes
  }

  /**
   * Initialize Webpack here if we're in production. Production assumes that
   * core workers and API nodes are on different machines. During develop-
   * ment we'll run webpack from an API middleware, because hot module
   * replacement requires a webpack instance on the same process.
   */
  async initBuild () {
    cubic.log.monitor('Started Webpack build process. This may take a while...', true, '')
    if (cubic.config.local.environment === 'production') {
      await this.initWebpackProd()
    } else {
      await this.initWebpackDev()
    }
  }

  /**
   * Run webpack locally, assuming production environment.
   */
  async initWebpackProd () {
    await new Promise((resolve, reject) => {
      const timer = new Date()
      webpack([this.config.client, this.config.server], (err, stats) => {
        if (err || stats.hasErrors()) {
          return reject(err || stats.toJson().errors)
        }
        cubic.log.monitor('Webpack build successful', true, `${new Date() - timer}ms`)
        resolve()
      })
    })
  }

  /**
  * Hook HMR middleware into API node and bundle from there
  */
  async initWebpackDev () {
    const publicPath = this.config.client.output.path
    const readFile = (mfs, file) => mfs.readFileSync(path.join(publicPath, file), 'utf-8')
    const copyFile = (mfs, file) => promisify(fs.writeFile)(path.join(publicPath, file), readFile(mfs, file))
    mkdirp(publicPath)

    // Modify client config to work with hot middleware
    this.addHmrPlugins()
    const compiler = webpack([this.config.client, this.config.server])
    const devMiddleware = require('webpack-dev-middleware')(compiler, {
      logLevel: 'warn',
      stats: 'errors-only',
      noInfo: true,
      watchOptions: { aggregateTimeout: 0 }
    })
    const hotMiddleware = require('webpack-hot-middleware')(compiler, { heartbeat: 100 })
    this.addMiddleware(devMiddleware)
    this.addMiddleware(hotMiddleware)

    compiler.plugin('done', stats => {
      stats = stats.toJson()
      if (stats.errors.length) {
        console.error(stats.error)
      }
      stats.children.forEach(bundle => {
        bundle.assets.forEach(asset => {
          if (asset.name.includes('bundle') || asset.name.includes('manifest')) {
            copyFile(devMiddleware.fileSystem, asset.name)
          }
        })
      })
    })
  }

  addHmrPlugins () {
    this.config.client.entry.client = ['webpack-hot-middleware/client', this.config.client.entry.client]
    this.config.client.output.filename = 'dev-[name].bundle.js'
    this.config.client.plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  addMiddleware (middleware) {
    const server = cubic.nodes.ui.api.server
    server.http.app._router.stack.pop()
    server.http.app.use(middleware)
    server.applyRoutes(cubic.config.ui.api)
  }
}

module.exports = WebpackServer
