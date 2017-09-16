import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export function createStore (blitz) {
  const store = new Vuex.Store()
  store.$blitz = blitz
  return store
}
