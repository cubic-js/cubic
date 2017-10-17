import Vue from 'vue'
import { createApp } from './app.js'
import Progress from 'src/components/ui/progress.vue'

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
    const storeModules = activated.map(c => c.beforeCreate).filter(_ => _)
    const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
    if (!asyncDataHooks.length) {
      return next()
    }

    // Start progress bar
    progress.start()

    // Register component's store modules, then call asyncData
    storeModules.map(register => register[0].bind({ $store: store })())
    await Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))

    // End loading bar
    progress.finish()
    next()
  })
  app.$mount('#app')
})
