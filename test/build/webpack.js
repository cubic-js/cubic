const webpack = require('webpack')

async function bundle () {
  // Load up Cubic to generate routes config file
  const loader = require('cubic-loader')
  loader({ logLevel: 'silent', skipAuthCheck: true })

  // Load up UI node. No Auth needed, we only need to register the endpoints
  // as routes.
  const Ui = require('cubic-ui')
  const redisUrl = 'redis://redis'
  const mongoUrl = 'mongodb://mongodb'
  const ci = process.env.DRONE
  await cubic.use(new Ui(ci ? {
    api: { redisUrl },
    core: { redisUrl, mongoUrl },
    webpack: { skipBuild: true }
  } : { webpack: { skipBuild: true } }))

  // Generate routes config file
  await cubic.nodes.ui.core.client.api.connections()
  await cubic.nodes.ui.core.webpackServer.registerEndpoints()
  const client = require(cubic.config.ui.webpack.clientConfig)
  const server = require(cubic.config.ui.webpack.serverConfig)

  // Build webpack bundles
  await new Promise((resolve, reject) => {
    webpack([client, server], (err, stats) => {
      if (err || stats.hasErrors()) {
        return reject(err || stats.toJson().errors)
      }
      resolve()
    })
  })

  // Reset cubic global
  cubic.nodes.ui.api.server.http.server.close()
  delete global.cubic
}

module.exports = bundle
