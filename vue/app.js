/**
 * app.js is the universal entry to our app. In a client-only app, we would
 * create the root Vue instance right in this file and mount directly to DOM.
 * However, for SSR that responsibility is moved into the client-only entry
 * file. app.js simply exports a createApp function
 */
import Vue from 'vue'
import VueTouch from 'vue-touch-hotfix'
import App from 'src/app.vue'
import Client from 'cubic-client/browser'
import { createRouter } from './router'
import { createStore } from './store'
import { sync } from 'vuex-router-sync'

// export a factory function for creating fresh app, router and store
// instances
export function createApp (context) {
  /* eslint no-undef: "off" */
  Vue.prototype.$cubic = new Client({
    api_url: $apiUrl,
    auth_url: $authUrl
  })

  const router = createRouter()
  const store = createStore(Vue.prototype.$cubic)

  // sync the router with the vuex store.
  // this registers `store.state.route`
  sync(store, router)

  // Add vue-touch. Not sure if this should be added by default.
  Vue.use(VueTouch)

  // create the app instance.
  // here we inject the router, store and ssr context to all child components,
  // making them available everywhere as `this.$router` and `this.$store`.
  const app = new Vue({
    router,
    store,
    render: createElement => createElement(App)
  })
  return { app, router, store }
}
