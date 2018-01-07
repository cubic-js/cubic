/**
 * blitz.js authentication server
 * Web-API to get authentication for resource servers
 */
const local = require("./config/local.js")
const path = require('path')
const fs = require("fs")
const promisify = require("util").promisify
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const webpack = require('webpack')

/**
 * Loader for auth-node system. For ease of maintenance, the auth-node consists
 * of a core-node that is connected to its own api-node as web server, much
 * like a regular blitz.js project
 */
class View {
  constructor(options) {
    this.config = {
      local: local,
      provided: options
    }
  }

  /**
   * Run any function from a remote process with `this` context
   */
  run (fn) {
    return fn.apply(this)
  }

  /**
   * Hook node components for actual logic
   */
  async init() {
    await this.initBlitz()
    await this.registerEndpoints()
    await this.initWebpack()
  }

  async initBlitz() {
    const Core = require("blitz-js-core")
    const API = require("blitz-js-api")

    await blitz.use(new API(blitz.config.view.api))
    await blitz.use(new Core(blitz.config.view.core))
  }

  /**
   * Initialize Webpack here if we're in production. Production assumes that
   * core workers and API nodes are on different machines. During develop-
   * ment we'll run webpack from an API middleware, because hot module
   * replacement requires a webpack instance on the same process.
   */
  initWebpack() {
    blitz.log.monitor('Started Webpack build process. This may take a while...', true, '')
    if (blitz.config.local.environment === "production") {
      this.initWebpackProd()
    } else {
      this.initWebpackDev()
    }
  }

  /**
   * Run webpack locally, assuming production environment.
   */
  async initWebpackProd() {
    const timer = new Date
    const clientConfig = require(blitz.config.view.webpack.clientConfig)
    const serverConfig = require(blitz.config.view.webpack.serverConfig)
    const compiled = await promisify(webpack)([clientConfig, serverConfig])

    if (compiled.errors) {
      throw compiled.errors
    } else {
      blitz.log.monitor("Webpack build successful", true, `${new Date - timer}ms`)
    }
  }

  /**
  * Hook HMR middleware into API node and bundle from there
  */
 async initWebpackDev() {
   await blitz.nodes.view_api.run(function() {
     const clientConfig = require(blitz.config.view.webpack.clientConfig)
     const serverConfig = require(blitz.config.view.webpack.serverConfig)
     const publicPath = clientConfig.output.path

     // Dependencies
     const webpack = require("webpack")
     const util = require("util")
     const fs = require("fs")
     const path = require("path")
     const readFile = (mfs, file) => mfs.readFileSync(path.join(publicPath, file), "utf-8")
     const copyFile = (mfs, file) => util.promisify(fs.writeFile)(path.join(publicPath, file), readFile(mfs, file))

     // Modify client config to work with hot middleware
     clientConfig.entry.client = ["webpack-hot-middleware/client", clientConfig.entry.client]
     clientConfig.output.filename = "[name].bundle.js"
     clientConfig.plugins.push(
       new webpack.HotModuleReplacementPlugin(),
       new webpack.NoEmitOnErrorsPlugin()
     )
     const compiler = webpack([clientConfig, serverConfig])
     const devMiddleware = require("webpack-dev-middleware")(compiler, {
       noInfo: true,
       publicPath: '/'
     })
     const hotMiddleware = require("webpack-hot-middleware")(compiler, {
       log: console.log,
       heartbeat: 1000
     })

     // Put middleware at start of stack
     // Step 2: Attach the dev middleware to the compiler & the server
     this.server.appendMiddleware(devMiddleware)

     // Step 3: Attach the hot middleware to the compiler & the server
     this.server.appendMiddleware(hotMiddleware)

     compiler.plugin("done", stats => {
       stats = stats.toJson()
       if (stats.errors.length) {
         throw stats.errors
       }
       stats.children.forEach(bundle => {
         bundle.assets.forEach(asset => {
           if (asset.name.includes('bundle') || asset.name.includes('manifest')) {
             copyFile(devMiddleware.fileSystem, asset.name)
           }
         })
       })
     })
   })
 }

  /**
   * Register routes in vue-router file. It can't be done in runtime, so
   * we gotta ensure the file is ready before rendering anything.
   */
  async registerEndpoints() {
    const routes = await this.getViewConstants()
    let routeOutput = `/**
                    * Auto-generated routes from blitz.js view node. We can't
                    * get them at runtime, so we need to save them like a config
                    * file pre-build.
                    */
                    export default ${JSON.stringify(routes, null, 2)}
                    `

    // Lazy cleanup for stringified functions
    routeOutput = routeOutput.replace(/"\(\) \=\>/g, '() =>').replace(/`\)"/g, '`)')

    // Save to file
    await writeFile(path.join(__dirname, 'vue/router/routes.js'), routeOutput)
  }

  /**
   * Generate plaintext constants which will be saved in the router file
   */
  async getViewConstants() {
    const srcDir = blitz.config.view.core.sourcePath.replace(/\\/g, '/')
    const endpoints = await blitz.nodes.view_core.run(function() {
      return this.client.endpointController.endpoints
    })
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
}

module.exports = View
