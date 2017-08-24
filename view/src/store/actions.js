/**
 * Methods for retrieving/calculating data
 */
import Blitz from 'blitz-js-query-browser'
let client

export function createActions(api) {
  // We're on the server -> Get pre-connected api connection from node
  if (api) {
    client = api
  }
  // We're on the client -> load API connection
  else {
    client = new Blitz()
  }

  // Expose methods of client to actions
  let actions = []
  for (let property in client) {
    typeof client[property] === 'function' ? actions.push(client[property]) : 0
  }

  // Merge client methods with custom actions
  return Object.assign(actions, {
    setValue({ commit }, value) {
      commit("setValue", value)
    }
  })
}
