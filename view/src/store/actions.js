/**
 * Methods for retrieving/calculating data
 */
let client
let userActions
try {
  userActions = require('src/store/actions')
}
catch (err) {}

export function createActions() {

  // Merge with user provided actions
  let actions = userActions || {}

  // Merge client methods with custom actions
  return Object.assign(actions, {

  })
}
