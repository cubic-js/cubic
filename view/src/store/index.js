import Vue from 'vue'
import Vuex from 'vuex'
import { createActions } from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex)

export function createStore (api) {
  const actions = createActions(api)
  return new Vuex.Store({
    state: {},
    actions,
    mutations,
    getters
  })
}
