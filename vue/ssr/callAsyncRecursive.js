/**
 * Helper function for recursive asyncData calling of matched components
 */
const callAsyncRecursive = async (parent, store, router) => {
  // Traverse components if available
  if (parent.components) {
    await Promise.all(Object.keys(parent.components).map(c => callAsyncRecursive(parent.components[c], store, router)))
  }
  // Main parent or traversed child has asyncData -> call
  if (parent.asyncData) {
    parent.$router = router
    parent.$store = store
    parent.$cubic = store.$cubic
    return parent.asyncData({
      store,
      route: router.currentRoute
    })
  }
}

exports.callAsyncRecursive = callAsyncRecursive
