/**
 * Technically we're already routing url's on the blitz.js endpoints, however
 * the vue-router allows for more advanced frontend techniques like keeping
 * state accross pages or adding transitions
 */
import Vue from 'vue'
import Router from 'vue-router'
import routes from "./routes.js"

Vue.use(Router)

export function createRouter() {
  const config = {
    mode: 'history',
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        return {
          x: 0,
          y: 0
        }
      }
    },
    routes
  }
  
  return new Router(config)
}
