import Vue from 'vue'
import { createApp } from './app.js'
import { callAsyncRecursive } from './ssr/callAsyncRecursive.js'
import { registerStoreModules } from './ssr/registerStoreModules.js'
import root from 'src/app.vue'
import Progress from 'src/components/progress.vue'

// Register global progress bar
const progress = Vue.prototype.$progress = new Vue(Progress).$mount()
document.body.appendChild(progress.$el)

// Create main Vue instance
const { app, router, store } = createApp()

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

// set access token of client-side api, delete after against possible exploitation
if (store.state.$access_token) {
  app.$cubic.setAccessToken(store.state.$access_token)
  delete store.state.$access_token
}

// Wait until router has resolved possible async hooks
router.onReady(() => {
  const routerView = router.getMatchedComponents()

  // Register dynamic store components on direct page load. We'll need to
  // pass a true value for the third param of the register function here to
  // check if we already got our state server-sided.
  registerStoreModules(root, store)
  routerView.map(component => registerStoreModules(component, store, true))

  // Add router hook for handling asyncData.
  // Doing it after initial route is resolved so that we don't double-fetch
  // the data that we already have. Using router.beforeResolve() so that all
  // async components are resolved.
  router.beforeResolve(async (to, from, next) => {
    const matched = router.getMatchedComponents(to)

    // Register dyanmic store modules on route change (not direct load!)
    registerStoreModules(root, store)
    matched.map(component => registerStoreModules(component, store, true))

    // Call asyncData
    await Promise.all(matched.map(c => callAsyncRecursive(c, store, router, to, progress)))

    // End loading bar
    progress.finish()
    next()
  })
  app.$mount('#app')
})
