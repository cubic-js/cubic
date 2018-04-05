import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export function createStore (cubic) {
  const store = new Vuex.Store()
  store.$cubic = cubic
  return store
}
