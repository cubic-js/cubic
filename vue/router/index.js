/**
 * Technically we're already routing url's on the cubic endpoints, however
 * the vue-router allows for more advanced frontend techniques like keeping
 * state accross pages or adding transitions
 */
import Vue from 'vue'
import Router from 'vue-router'
import routes from './routes.js'
import Meta from 'vue-meta'

Vue.use(Router)
Vue.use(Meta, { keyName: 'head' })

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
