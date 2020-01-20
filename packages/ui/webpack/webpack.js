const fs = require('fs')
const { promisify } = require('util')
const path = require('path')

class WebpackServer {
  constructor () {
    this.config = {
      client: require(cubic.config.ui.webpack.clientConfig),
      server: require(cubic.config.ui.webpack.serverConfig)
    }
  }

  /**
   * Entrypoint for hook on cubic-core
   */
  async init () {
    await this.registerEndpoints()

    if (!cubic.config.ui.webpack.skipBuild) {
      await this.initBuild()
    }
  }

  /**
   * Register routes in vue-router file. It can't be done at runtime, so
   * we gotta ensure the file is ready before rendering anything.
   */
  async registerEndpoints () {
    const routes = await this.getViewConstants()

    // Order parameterized url's so they can't replace already defined routes.
    // e.g. /something/:param/:param must not be routed before /something/whatever/:param
    routes.sort((a, b) => {
      const aCount = a.path.split(':').length
      const bCount = b.path.split(':').length
      return aCount - bCount
    })

    const writeFile = promisify(fs.writeFile)
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
   * Generate plaintext constants which will be saved in the router file.
   */
  async getViewConstants () {
    const endpoints = cubic.nodes.ui.api.server.http.endpoints.endpoints
    let routes = []

    for (const endpoint of endpoints) {
      if (!endpoint.view && !endpoint.custom) continue
      let component
      if (endpoint.view) {
        component = `() => import(\`src/${endpoint.view}\`)`
      } else {
        component = `() => import(\`${endpoint.custom}\`)`
      }

      routes.push({
        path: endpoint.route,
        component,
        props: true,
        meta: {
          scope: endpoint.scope
        }
      })
    }
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
      this.done = await this.initWebpackProd()
    } else {
      this.done = await this.initWebpackDev()
    }
  }

  /**
   * Run webpack locally, assuming production environment.
   */
  async initWebpackProd () {
    const webpack = require('webpack')
    const timer = new Date()
    const build = webpack([this.config.client, this.config.server])
    const compile = promisify(build.run).bind(build)
    await compile()
    cubic.log.monitor('Webpack build successful', true, `${new Date() - timer}ms`)
  }

  /**
   * Hook HMR middleware into API node and bundle from there
   */
  async initWebpackDev () {
    const DevMiddleware = require('webpack-dev-middleware')
    const HotMiddleware = require('webpack-hot-middleware')
    const mkdirp = require('mkdirp')
    const webpack = require('webpack')
    const publicPath = this.config.client.output.path
    const readFile = (mfs, file) => mfs.readFileSync(path.join(publicPath, file), 'utf-8')
    const copyFile = (mfs, file) => promisify(fs.writeFile)(path.join(publicPath, file), readFile(mfs, file))
    mkdirp(publicPath)

    // Modify client config to work with hot middleware
    this.addHmrPlugins()
    const compiler = webpack([this.config.client, this.config.server])
    const devMiddleware = DevMiddleware(compiler, {
      logLevel: 'warn',
      stats: 'errors-only',
      noInfo: true,
      publicPath,
      watchOptions: { aggregateTimeout: 0 }
    })
    const hotMiddleware = HotMiddleware(compiler, { heartbeat: 100 })
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
    const webpack = require('webpack')
    this.config.client.entry.client = ['webpack-hot-middleware/client', this.config.client.entry.client]
    this.config.client.output.filename = 'dev-[name].bundle.js'
    this.config.client.plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  addMiddleware (middleware) {
    const server = cubic.nodes.ui.api.server
    server.http.app.wares.unshift(middleware)
  }
}

module.exports = WebpackServer
