/**
 * blitz.js authentication server
 * Web-API to get authentication for resource servers
 */
const local = require("./config/local.js")
const worker = require("blitz-js-util")
const path = require('path')
const fs = require("fs")
const promisify = require("util").promisify
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const webpack = promisify(require('webpack'))

/**
 * Loader for auth-node system. For ease of maintenance, the auth-node consists
 * of a core-node that is connected to its own api-node as web server, much
 * like a regular blitz.js project
 */
class View {
  constructor(options) {

    // Process forked
    if (process.env.isWorker) {
      this.setup = worker.setGlobal()
      this.setup.then(() => this.init())
      worker.expose(this)
    }

    // Process not forked
    else {

      // Config which is called by blitz.js on blitz.use()
      this.config = {
        local: local,
        provided: options
      }

      // Path for forking
      this.filename = __filename
    }
  }


  /**
   * Hook node components for actual logic
   */
  async init() {
    this.initBlitz()
    if (blitz.config[blitz.id].isCore) {
      await this.registerEndpoints()
      await this.initWebpack()
    }
  }


  /**
   * Nodes must be required here, otherwise worker spawn will trigger them to create
   * a new object on require due to process.env.isWorker = true. (which won't
   * work because no config is set)
   */
  initBlitz() {
    delete process.env.isWorker
    const Core = require("../blitz-js-core")
    const API = require("../blitz-js-api")
    const Blitz = require("blitz-js")(blitz.config.local)

    // Apply config to nodes and hook them
    let options = blitz.config[blitz.id]

    // API node which controls incoming requests
    options.id = "view_api"
    blitz.use(new API(options))

    // Core Node which processes incoming requests
    options.id = "view_core"
    blitz.use(new Core(options))

    // Set proces state back to original
    process.env.isWorker = true
  }


  /**
   * Initialize Webpack here if we're in production. Production assumes that
   * core workers and API nodes are on different machines. During develop-
   * ment we'll run webpack from an API middleware, because hot module
   * replacement requires a webpack instance on the same process.
   */
  initWebpack() {
    if (blitz.config.local.environment === "production") {
      this.initWebpackLocal()
    } else {
      this.initWebpackLocal()
    }
  }


  /**
   * Run webpack locally, assuming production environment.
   */
  async initWebpackLocal() {
    const timer = new Date
    const clientConfig = require(blitz.config[blitz.id].webpack.clientConfig)
    const serverConfig = require(blitz.config[blitz.id].webpack.serverConfig)
    const compiled = await webpack([clientConfig, serverConfig])
    if (compiled.errors) {
      throw compiled.errors
    } else {
      blitz.log.monitor("Webpack build successful", true, `${new Date - timer}ms`)
    }
  }


  /**
   * Hook HMR middleware into API node and bundle from there
   */
  async initWebpackOnAPI() {
    await blitz.nodes.view_api.run(function() {
      const clientConfig = require(blitz.config[blitz.id].webpack.clientConfig)
      const serverConfig = require(blitz.config[blitz.id].webpack.serverConfig)
      const publicPath = clientConfig.output.path

      // Dependencies
      const webpack = require("webpack")
      const util = require("util")
      const fs = require("fs")
      const path = require("path")
      const readFile = (mfs, file) => mfs.readFileSync(path.join(publicPath, file), "utf-8")
      const copyFile = (mfs, file) => util.promisify(fs.writeFile)(path.join(publicPath, file), readFile(mfs, file))

      // Modify client config to work with hot middleware
      clientConfig.entry.app = ["webpack-hot-middleware/client?path=/__hot", clientConfig.entry.app]
      clientConfig.output.filename = "[name].js"
      clientConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
      )
      const compiler = webpack([clientConfig, serverConfig])
      const devMiddleware = require("webpack-dev-middleware")(compiler, {
        noInfo: true,
        publicPath: clientConfig.output.publicPath
      })
      const hotMiddleware = require("webpack-hot-middleware")(compiler, {
        log: console.log,
        path: '/__hot',
        heartbeat: 10 * 1000
      })

      // Step 2: Attach the dev middleware to the compiler & the server
      this.server.http.app.use(devMiddleware)

      // Step 3: Attach the hot middleware to the compiler & the server
      this.server.http.app.use(hotMiddleware)

      compiler.plugin("done", stats => {
        stats = stats.toJson()
        if (stats.errors.length) {
          throw stats.errors
        }
        stats.children.forEach(bundle => {
          bundle.assets.forEach(asset => {
            copyFile(devMiddleware.fileSystem, asset.name)
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
    let endpoints = await blitz.nodes.view_core.generateEndpointSchema()
    let routes = []
    let views = []
    endpoints.forEach(endpoint => {
      let route = {
        path: endpoint.route,
        component: endpoint.view,
        props: true
      }
      let view = `const ${endpoint.view.replace(/\/|\\|\.|\-/g, "")} = require("${blitz.config[blitz.id].sourcePath.replace(/\\/g, "\\\\")}/${endpoint.view}").default`
      routes.push(route)
      views.find(el => el === view) ? null : views.push(view)
    })
    views.unshift("//start-view-injection")
    views.push("//end-view-injection")

    // Inject view variables into router. We can't dynamically require views
    // at runtime, so we have to do it pre-build this way.
    let viewFile = `${__dirname}/view/src/router/index.js`
    let viewInject = views.join("\n")
    let viewRegex = /^\/\/start-view-injection[\s\S]*\/\/end-view-injection$/im
    let viewOutput = await readFile(viewFile, "utf-8")
    viewOutput = viewOutput.replace(viewRegex, viewInject)
    await writeFile(viewFile, viewOutput)

    // Save Routes
    let routeFile = `${__dirname}/view/src/router/routes.js`
    let routeOutput = `/**
                    * Auto-generated routes from blitz.js view node.
                    * Components will be eval'd, so full functionality is preserved.
                    */
                    export default ${JSON.stringify(routes)}
                    `
    await writeFile(routeFile, routeOutput.replace(/^                 /gm, ""))
  }
}

module.exports = process.env.isWorker ? new View() : View
