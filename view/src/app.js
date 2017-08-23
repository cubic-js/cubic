/**
 * app.js is the universal entry to our app. In a client-only app, we would
 * create the root Vue instance right in this file and mount directly to DOM.
 * However, for SSR that responsibility is moved into the client-only entry
 * file. app.js simply exports a createApp function
 */
import Vue from 'vue'
import App from 'src/app.vue'
import { createRouter } from "./router"
//import { createStore } from "src/store"
//import { sync } from "vuex-router-sync"

// export a factory function for creating fresh app, router and store
// instances
export function createApp(context) {
    const router = createRouter()
    //const store = createStore()

    // sync the router with the vuex store.
    // this registers `store.state.route`
    //sync(store, router)

    // create the app instance.
    // here we inject the router, store and ssr context to all child components,
    // making them available everywhere as `this.$router` and `this.$store`.
    const app = new Vue({
        router,
        //store,
        render: createElement => createElement(App)
    })
    return { app, router }
}
