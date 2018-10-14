/**
 * Helper function to automatically register all existing store modules
 * before we run asyncData functions that may depend on them
 */
const registerStoreModules = (parent, store, checkPreState) => {
  // Traverse components if available
  if (parent.components) {
    Object.keys(parent.components).forEach(c => registerStoreModules(parent.components[c], store, checkPreState))
  }
  // Main parent or traversed child has store module -> register
  if (parent.storeModule) {
    let preserveState = {}
    if (!parent.storeModule.reregister && checkPreState) {
      preserveState = {
        preserveState: !!store.state[parent.storeModule.name]
      }
    }
    let preregistered = false

    // Figure out if module was already registered client-side. (SSR won't add
    // mutations, actions and such)
    if (parent.storeModule.mutations) {
      preregistered = store._mutations[Object.keys(parent.storeModule.mutations)[0]]
    } else if (parent.storeModule.actions) {
      preregistered = store._actions[Object.keys(parent.storeModule.actions)[0]]
    } else if (parent.storeModule.getters) {
      preregistered = store._getters[Object.keys(parent.storeModule.getters)[0]]
    }

    // Avoid double registrations
    return !preregistered ? store.registerModule(parent.storeModule.name, parent.storeModule, preserveState) : null
  }
}

exports.registerStoreModules = registerStoreModules
