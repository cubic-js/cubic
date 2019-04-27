const assert = require('assert')
const Client = require(`${process.cwd()}/packages/client`)
const MongoClient = require('mongodb').MongoClient
const bcrypt = require('bcryptjs')
const ci = process.env.DRONE

/**
 * Tests for properly responding to usual requests.
 */
describe('Authentication', function () {
  let client, db, user_key, refresh_token

  before(async () => {
    const mongoUrl = ci ? 'mongodb://mongodb' : 'mongodb://localhost:27017'
    const mongo = await MongoClient.connect(mongoUrl, { useNewUrlParser: true })
    client = new Client({ api_url: 'ws://localhost:3030/ws' })
    db = mongo.db('cubic-auth')
  })

  it('should create default system user', function () {
    assert(cubic.nodes.auth.api.systemUser.user_key)
    assert(cubic.nodes.auth.api.systemUser.user_secret)
  })

  // Register user
  it('should register user on POST /register', async function () {
    await db.collection('users').deleteOne({ user_id: 'cubic-auth-test' })
    const res = await client.post('/register', {
      user_id: 'cubic-auth-test',
      user_secret: 'test'
    })
    const user = await db.collection('users').findOne({ user_id: 'cubic-auth-test' })
    const valid = await bcrypt.compare('test', user.user_secret)
    assert(valid)
    user_key = res.user_key
  })

  it('should return the user\'s user_key on POST /userkey', async function () {
    const res = await client.post('/userkey', {
      user_id: 'cubic-auth-test',
      user_secret: 'test'
    })
    const user = await db.collection('users').findOne({ user_id: 'cubic-auth-test' })
    assert(user_key === res.user_key && user_key === user.user_key)
  })

  it('should return access_token and refresh_token on POST /authenticate', async function () {
    const res = await client.post('/authenticate', {
      user_key,
      user_secret: 'test'
    })
    assert(res.access_token && res.refresh_token)
    refresh_token = res.refresh_token
  })

  it('should refresh access_token on POST /refresh', async function () {
    const res = await client.post('/refresh', { refresh_token })
    assert(res.access_token)
  })
})
