/**
 * Helper function get http response as soon as server loaded
 */
const request = require('request-promise')

module.exports = async function get (url) {
  return new Promise(async resolve => {
    try {
      resolve(await request.get(`http://localhost:3003${url}`))
    } catch (err) {
      setTimeout(async () => {
        resolve(await get(url))
      }, 500)
    }
  })
}
