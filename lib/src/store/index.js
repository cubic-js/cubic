import Vue from 'vue'
import Vuex from 'vuex'
import { createActions } from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex)

export function createStore () {
  const actions = createActions()
  return new Vuex.Store({
    state: {
      search: {}
    },
    actions,
    mutations,
    getters
  })
}
