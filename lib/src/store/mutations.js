// Helper function to access nested key from string
Object.resolve = function(obj, path) {
    return path.split('.').reduce(function(prev, curr) {
        return prev ? prev[curr] : undefined
    }, obj || self)
}

/**
 * Changes in state data are set with these methods
 */
export default {
  set(state, data) {
    state[data.key] = data.value
  },

  run(state, data) {
    Object.resolve(state, data.key)[data.method](data.value)
  }
}
