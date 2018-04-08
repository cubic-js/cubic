const assert = require('assert')
const Client = require('../../cubic-client')
const MongoClient = require('mongodb').MongoClient
const bcrypt = require('bcryptjs')

/**
 * Tests for properly responding to usual requests.
 */
describe('Requests', function () {
  let client, db, user_key, access_token, refresh_token

  before(async () => {
    const mongo = await MongoClient.connect('mongodb://localhost:27017')
    client = new Client({ api_url: 'http://localhost:3030' })
    db = mongo.db('cubic-auth')
  })


  // Register user
  it('should register user on POST /register', async function () {
    await db.collection('users').remove({ user_id: 'test' })
    const res = await client.post('/register', {
      user_id: 'test',
      user_secret: 'test'
    })
    const user = await db.collection('users').findOne({ user_id: 'test' })
    const valid = await bcrypt.compare('test', user.user_secret)
    assert(valid)
    user_key = res.user_key
  })


  it('should return the user\'s user_key on POST /userkey', async function () {
    const res = await client.post('/userkey', {
      user_id: 'test',
      user_secret: 'test'
    })
    const user = await db.collection('users').findOne({ user_id: 'test' })
    assert(user_key === res.user_key && user_key === user.user_key)
  })


  it('should return access_token and refresh_token on POST /authenticate', async function () {
    const res = await client.post('/authenticate', {
      user_key,
      user_secret: 'test'
    })
    assert(res.access_token && res.refresh_token)
    access_token = res.access_token
    refresh_token = res.refresh_token
  })


  it('should refresh access_token on POST /refresh', async function () {
    const res = await client.post('/refresh', { refresh_token })
    assert(res.access_token)
  })
})