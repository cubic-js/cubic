/**
 * Helper function for recursive asyncData calling of matched components
 */
const callAsyncRecursive = async (parent, store, router, route, progress, progressStarted = false) => {
  // Traverse components if available
  if (parent.components) {
    await Promise.all(Object.keys(parent.components).map(c => {
      return callAsyncRecursive(parent.components[c], store, router, route, progress, progressStarted)
    }))
  }
  // Main parent or traversed child has asyncData -> call
  if (parent.asyncData) {
    if (!progressStarted && progress) {
      progress.start()
      progressStarted = true
    }
    parent.$router = router
    parent.$store = store
    parent.$cubic = store.$cubic
    return parent.asyncData({ store, route })
  }
}

exports.callAsyncRecursive = callAsyncRecursive
