import Vue from 'vue'
import { createApp } from './app.js'
import { registerStoreModules } from './ssr/registerStoreModules.js'
import root from 'src/app.vue'
const Progress = require('src/components/progress.vue')

// Register global progress bar
const progress = Vue.prototype.$progress = new Vue(Progress).$mount()
document.body.appendChild(progress.$el)

// Global mixin that calls `asyncData` when a route component's params change
Vue.mixin({
  async beforeRouteUpdate (to, from, next) {
    const { asyncData } = this.$options

    if (asyncData) {
      progress.start()
      await asyncData({
        store: this.$store,
        route: to
      })
      progress.finish()
      next()
    } else {
      next()
    }
  }
})

// Create main Vue instance
const { app, router, store } = createApp()

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
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
    const prevMatched = router.getMatchedComponents(from)
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })

    // Register dyanmic store modules on route change (not direct load!)
    registerStoreModules(root, store)
    activated.map(component => registerStoreModules(component, store, true))

    // Start async data fetching
    const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
    if (!asyncDataHooks.length) {
      return next()
    }

    // Start progress bar
    progress.start()

    // Call asyncData
    await Promise.all(asyncDataHooks.map(asyncData => {
      const parent = matched[0]
      parent.$router = router
      parent.$store = store
      parent.$cubic = store.$cubic
      return asyncData.bind(parent)({ store, route: to })
    }))

    // End loading bar
    progress.finish()
    next()
  })
  app.$mount('#app')
})
