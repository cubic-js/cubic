/**
 * Helper functions to control auth node endpoints
 */
class Auth {
  async init () {
    const Register = this.getEndpointFile('register')
    const Authenticate = this.getEndpointFile('authenticate')
    const mongo = await cubic.nodes.auth.core.client.endpointController.db
    this.db = mongo.db(cubic.config.auth.core.mongoDb)
    this.api = cubic.nodes.auth.core.client.api

    // Res replacer
    this.res = {}
    this.res.status = () => this.res
    this.res.send = () => {}

    // Endpoints
    this.register = new (require(Register))(this.api, this.db, '/register')
    this.authenticate = new (require(Authenticate))(this.api, this.db, '/refresh')
    this.register.res = this.res
    this.authenticate.res = this.res
  }

  /**
   * Helper function to quickly get endpoint paths from core node
   */
  getEndpointFile (endpoint) {
    return cubic.nodes.auth.core.client.endpointController.endpoints
      .find(e => e.name === endpoint).file
  }

  /**
   * user_key
   */
  async getUserKey () {
    const req = { body: { user_id: 'test', user_secret: 'test' }, user: { uid: '::1' } }
    let user_key = await this.register.newUser(req.body, req)

    // No user_key means the user is already registered
    if (!user_key) {
      user_key = (await this.db.collection('users').findOne({ user_id: 'test' })).user_key
    }

    // Not registered means we gotta set the test scope
    else {
      this.db.collection('users').updateOne({ user_id: 'test' }, { $set: { scope: 'write_test' } })
    }
    return user_key
  }

  /**
   * refresh_token
   */
  async getRefreshToken () {
    return this.authenticate.generateRefreshToken(await this.getUserKey())
  }

  /**
   * access_token
   */
  async getAccessToken () {
    const user_key = await this.getUserKey()
    const credentials = { user_key, user_secret: 'test' }
    const req = { user: { uid: '::1' } }
    const data = await this.authenticate.matchCredentials(credentials, req)
    return data.access_token
  }
}

module.exports = new Auth()
