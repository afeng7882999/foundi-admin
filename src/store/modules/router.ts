/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { RouteRecordRaw } from 'vue-router'
import { ActionContext } from 'vuex'

export interface RouterState {
  routes: RouteRecordRaw[]
  routeLoaded: boolean
}

const state: RouterState = {
  routes: JSON.parse(window.localStorage.getItem('user.routes') || '[]'),
  routeLoaded: false
}

const mutations = {
  SET_ROUTES: (state: RouterState, routes: RouteRecordRaw[]) => {
    state.routes = routes
    window.localStorage.setItem('user.routes', JSON.stringify(routes))
  },
  SET_ROUTE_LOADED: (state: RouterState, loaded: boolean) => {
    state.routeLoaded = loaded
  }
}

const actions = {
  setRouteLoaded({ commit }: ActionContext<RouterState, unknown>, loaded: boolean) {
    commit('SET_ROUTE_LOADED', loaded)
  },
  setRoutes({ commit }: ActionContext<RouterState, unknown>, routes: RouteRecordRaw[]) {
    commit('SET_ROUTES', routes)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
