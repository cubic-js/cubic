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
    if (blitz.config.local.environment === "production") {
      this.initWebpackProd()
    } else {
      this.initWebpackOnApi()
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
   * Hook HMR middleware for development
   */
  async initWebpackDev() {
    const timer = new Date
    const clientConfig = require(blitz.config.view.webpack.clientConfig)
    const serverConfig = require(blitz.config.view.webpack.serverConfig)
    const compiler = webpack([clientConfig, serverConfig])
    compiler.watch({}, (err, stats) => {
      if (err) {
        throw err
      }
      stats = stats.toJson()
      if (stats.errors.length) {
        throw stats.errors
      }
    })
  }

  /**
  * Hook HMR middleware into API node and bundle from there
  */
 async initWebpackOnApi() {
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
    const entryDir = path.resolve(__dirname, 'vue')
    const { views, routes } = await this.getViewConstants(entryDir)

    // Inject view variables into router. We can't dynamically require views
    // at runtime, so we have to do it pre-build this way.
    const viewFile = path.resolve(entryDir, 'router/index.js')
    const viewInject = views.join("\n")
    const viewRegex = /^\/\/start-view-injection[\s\S]*\/\/end-view-injection$/im
    let viewOutput = await readFile(viewFile, "utf-8")
    viewOutput = viewOutput.replace(viewRegex, viewInject)
    await writeFile(viewFile, viewOutput)

    // Save Routes
    let routeFile = path.resolve(entryDir, 'router/routes.js')
    let routeOutput = `/**
                    * Auto-generated routes from blitz.js view node.
                    * Components will be eval'd, so full functionality is preserved.
                    */
                    export default ${JSON.stringify(routes)}
                    `
    await writeFile(routeFile, routeOutput.replace(/^                 /gm, ""))
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
    let views = []
    endpoints.forEach(endpoint => {
      let route = {
        path: endpoint.route,
        component: endpoint.view,
        props: true
      }
      let view = `const ${endpoint.view.replace(/[^a-zA-Z\d_]/g, "")} = require("${srcDir}/${endpoint.view}").default`
      routes.push(route)
      views.find(el => el === view) ? null : views.push(view)
    })
    views.unshift("//start-view-injection")
    views.push("//end-view-injection")

    return { views, routes }
  }
}

module.exports = View
