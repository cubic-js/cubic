import { createApp } from './app.js'
import { callAsyncRecursive } from './ssr/callAsyncRecursive.js'
import { registerStoreModules } from './ssr/registerStoreModules.js'
import root from 'src/app.vue'

/**
 * Generate App with pre-fetched data in store state
 */
export default function (context) {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp(context)

    // TODO: Make this work. Right now there's no way it would as it overlaps
    // with other requests. My suggestion is to fall back to HTTP requests
    // for asyncData hooks on the server. Otherwise we'd have to create
    // a new cubic-client instance on every request (terrible memory footprint)
    //
    // if (context.req.access_token) app.$cubic.setAccessToken(context.req.access_token)

    // Init vue-meta
    const meta = app.$meta()

    // Set router's location
    router.push(context.req.url)

    // Wait until router has resolved possible async hooks
    router.onReady(async () => {
      const routerView = router.getMatchedComponents()

      // Register all dynamic store modules in components first since asyncData
      // functions will likely depend on them. This also avoids the necessity to
      // load dependencies first if they're already present in the template.

      // router-view doesn't contain root template, so we call it additionally
      registerStoreModules(root, store)
      routerView.map(component => registerStoreModules(component, store))

      // Call asyncData hooks on components matched by the route recursively.
      // A asyncData hook dispatches a store action and returns a Promise,
      // which is resolved when the action is complete and store state has been
      // updated.

      // router-view doesn't contain root template, so we call it additionally
      await callAsyncRecursive(root, store, router)
      await Promise.all(routerView.map(component => callAsyncRecursive(component, store, router, router.currentRoute)))

      // After all asyncData hooks are resolved, our store is now
      // filled with the state needed to render the app.
      // Expose the state on the render context, and let the request handler
      // inline the state in the HTML response. This allows the client-side
      // store to pick-up the server-side state without having to duplicate
      // the initial data fetching on the client.
      context.state = store.state

      // Give access token to state so the client can use it
      if (context.req.access_token) context.state.$access_token = context.req.access_token

      // Finally, add meta tags to context for injection in renderer
      context.meta = { inject: function () { Object.assign(this, meta.inject()) } }

      resolve(app)
    })
  })
}
