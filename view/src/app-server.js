import {
  createApp
} from './app.js'

export default context => {
  return new Promise((resolve, reject) => {
    const {
      app,
      router,
      store
    } = createApp(context)
    const {
      url
    } = context

    // Set router's location
    router.push(url)

    // Wait until router has resolved possible async hooks
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()

      // Call asyncData hooks on components matched by the route recursively.
      // A preFetch hook dispatches a store action and returns a Promise,
      // which is resolved when the action is complete and store state has been
      // updated.
      Promise.all(matchedComponents.map(loaded => {
        const params = {
          store,
          route: router.currentRoute
        }
        const callAsyncRecursive = parent => {
          // First component isn't passed with component array
          if (parent.components) {
            callAsyncRecursive(parent.components)
            return parent.asyncData ? parent.asyncData(params) : 0
          }
          // Sub components are traversed
          else {
            for (let property in parent) {
              let obj = parent[property]
              // More sub components? recursively traverse them too
              if (obj.components) {
                callAsyncRecursive(obj.components)
              }
              if (obj.asyncData) {
                return obj.asyncData(params)
              }
            }
          }
        }
        return callAsyncRecursive(loaded)
      })).then(() => {
        // After all preFetch hooks are resolved, our store is now
        // filled with the state needed to render the app.
        // Expose the state on the render context, and let the request handler
        // inline the state in the HTML response. This allows the client-side
        // store to pick-up the server-side state without having to duplicate
        // the initial data fetching on the client.
        console.log(store.state)
        context.state = store.state
        resolve(app)
      })
    })
  })
}
