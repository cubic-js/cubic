const loader = require('blitz-js-loader')
const Api = require('../../../blitz-js-api')
const Auth = require('../../../blitz-js-auth')
const Core = require('../../../blitz-js-core')

class Server {
  async init() {
    loader({ logLevel: 'silent' })
    await blitz.use(new Auth())
    await blitz.use(new Api())
    await blitz.use(new Core({
      endpointPath: `${process.cwd()}/test/endpoints`,
      publicPath:`${process.cwd()}/test/assets`
    }))
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

module.exports = new Server