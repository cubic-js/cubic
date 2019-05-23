/**
 * Helper functions to control auth node endpoints
 */
class Auth {
  async init () {
    const Register = this.getEndpointFile('register')
    const Authenticate = this.getEndpointFile('authenticate')
    const endpoints = cubic.nodes.auth.api.server.ws.endpoints
    const db = this.db = (await endpoints.db).db(endpoints.config.mongoDb)
    const options = { db, cache: endpoints.cache, ws: endpoints.ws }

    // Res replacer
    this.res = {}
    this.res.status = () => this.res
    this.res.send = () => {}

    // Endpoints
    this.register = new (require(Register))({ ...options, ...{ url: '/register' } })
    this.authenticate = new (require(Authenticate))({ ...options, ...{ url: '/authenticate' } })
    this.register.res = this.res
    this.authenticate.res = this.res
  }

  /**
   * Helper function to quickly get endpoint paths from core node
   */
  getEndpointFile (endpoint) {
    return cubic.nodes.auth.api.server.ws.endpoints.endpoints
      .find(e => e.name === endpoint).file
  }

  /**
   * user_key
   */
  async getUserKey () {
    const req = { body: { user_id: 'cubic-client-test', user_secret: 'test' }, user: { uid: '::1' } }
    let user_key = await this.register.newUser(req.body, req)

    // No user_key means the user is already registered
    if (!user_key) {
      user_key = (await this.db.collection('users').findOne({ user_id: 'cubic-client-test' })).user_key
    }

    // Ensure write_test scope
    await this.db.collection('users').updateOne({ user_id: 'cubic-client-test' }, { $set: { scope: 'write_test' } })
    return user_key
  }

  /**
   * refresh_token
   */
  async getRefreshToken () {
    const user = await this.db.collection('users').findOne({ user_key: await this.getUserKey() })
    if (user.refresh_token) {
      return user.refresh_token
    }
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
