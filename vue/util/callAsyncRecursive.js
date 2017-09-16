/**
 * Helper function for recursive asyncData calling of matched components
 */
const callAsyncRecursive = async (parent, store, router) => {
  // Traverse components if available
  if (parent.components) {
    await callAsyncRecursive(parent.components, store, router)
  }
  // Register dynamic store modules in component first
  if (parent.beforeCreate) {
    parent.beforeCreate[0].bind({ $store: store })()
  }
  // Main parent or traversed child has asyncData -> call
  if (parent.asyncData) {
    return parent.asyncData({
      store,
      route: router.currentRoute
    })
  }
}

exports.callAsyncRecursive = callAsyncRecursive
