/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { _RouteLocationBase, LocationQuery, RouteParams } from 'vue-router'
import { ActionContext } from 'vuex'
import { Indexable } from '@/app/types'

interface ViewTitle {
  path: string
  title?: string
}

export interface ViewLocation {
  path: string
  fullPath: string
  query: LocationQuery
  name: string | symbol | null | undefined
  params: RouteParams
  meta: Indexable
  title: string | undefined
}

export interface ViewState {
  visitedViews: ViewLocation[]
  cachedViews: string[]
  viewTitles: ViewTitle[]
}

const state: ViewState = {
  visitedViews: JSON.parse(window.localStorage.getItem('view.visitedViews') || '[]'),
  cachedViews: [],
  viewTitles: []
}

const mutations = {
  ADD_VISITED_VIEW: (state: ViewState, view: _RouteLocationBase) => {
    if (state.visitedViews.some((v) => v.path === view.path)) return

    const viewTitle = state.viewTitles.filter((t) => t.path === view.path)[0]
    const title = ((viewTitle && viewTitle.title) || (view.meta && view.meta.title) || 'no-name') as string | undefined

    state.visitedViews.push({
      path: view.path,
      fullPath: view.fullPath,
      query: view.query,
      name: view.name,
      params: view.params,
      meta: view.meta,
      title
    })

    window.localStorage.setItem('view.visitedViews', JSON.stringify(state.visitedViews))
  },
  ADD_CACHED_VIEW: (state: ViewState, view: _RouteLocationBase) => {
    if (state.cachedViews.includes(view.name as string)) return
    if (!(view.meta && view.meta.noCache)) {
      state.cachedViews.push(view.name as string)
    }
  },
  ADD_VIEW_TITLE: (state: ViewState, viewTitle: ViewTitle) => {
    if (viewTitle.path && viewTitle.title) {
      if (state.viewTitles.some((v) => v.path === viewTitle.path)) return
      state.viewTitles.push(viewTitle)
    }
  },
  DEL_VISITED_VIEW: (state: ViewState, view: _RouteLocationBase) => {
    for (const [i, v] of state.visitedViews.entries()) {
      if (v.path === view.path) {
        state.visitedViews.splice(i, 1)
        break
      }
    }
    window.localStorage.setItem('view.visitedViews', JSON.stringify(state.visitedViews))
  },
  DEL_CACHED_VIEW: (state: ViewState, view: _RouteLocationBase) => {
    for (const i of state.cachedViews) {
      if (i === view.name) {
        const index = state.cachedViews.indexOf(i)
        state.cachedViews.splice(index, 1)
        break
      }
    }
  },
  DEL_VIEW_TITLE: (state: ViewState, view: _RouteLocationBase) => {
    for (const [i, v] of state.viewTitles.entries()) {
      if (v.path === view.path) {
        state.viewTitles.splice(i, 1)
        break
      }
    }
  },
  DEL_OTHERS_VISITED_VIEWS: (state: ViewState, view: _RouteLocationBase) => {
    state.visitedViews = state.visitedViews.filter((v) => {
      return (v.meta && v.meta.affix) || v.path === view.path
    })
    window.localStorage.setItem('view.visitedViews', JSON.stringify(state.visitedViews))
  },
  DEL_OTHERS_CACHED_VIEWS: (state: ViewState, view: _RouteLocationBase) => {
    for (const i of state.cachedViews) {
      if (i === view.name) {
        const index = state.cachedViews.indexOf(i)
        state.cachedViews = state.cachedViews.slice(index, index + 1)
        break
      }
    }
  },
  DEL_ALL_VISITED_VIEWS: (state: ViewState) => {
    // keep affix tags
    state.visitedViews = state.visitedViews.filter((tag) => tag.meta && tag.meta.affix)
    window.localStorage.setItem('view.visitedViews', '[]')
  },
  DEL_ALL_CACHED_VIEWS: (state: ViewState) => {
    state.cachedViews = []
  },
  UPDATE_VISITED_VIEW: (state: ViewState, view: _RouteLocationBase) => {
    for (let v of state.visitedViews) {
      if (v.path === view.path) {
        v = Object.assign(v, view)
        break
      }
    }
    window.localStorage.setItem('view.visitedViews', JSON.stringify(state.visitedViews))
  },
  UPDATE_VIEW_TITLE: (state: ViewState) => {
    const paths = state.visitedViews.map((v) => v.path)
    for (const [i, v] of state.viewTitles.entries()) {
      if (!paths.some((p) => p === v.path)) {
        state.viewTitles.splice(i, 1)
        break
      }
    }
  }
}

const actions = {
  async addView({ dispatch }: ActionContext<ViewState, unknown>, view: _RouteLocationBase) {
    await dispatch('addVisitedView', view)
    await dispatch('addCachedView', view)
  },
  addVisitedView({ commit }: ActionContext<ViewState, unknown>, view: _RouteLocationBase) {
    commit('ADD_VISITED_VIEW', view)
  },
  addCachedView({ commit }: ActionContext<ViewState, unknown>, view: _RouteLocationBase) {
    commit('ADD_CACHED_VIEW', view)
  },
  addViewTitle({ commit }: ActionContext<ViewState, unknown>, viewTitle: ViewTitle) {
    commit('ADD_VIEW_TITLE', viewTitle)
  },
  async delView({ state, dispatch }: ActionContext<ViewState, unknown>, view: _RouteLocationBase) {
    await dispatch('delVisitedView', view)
    await dispatch('delCachedView', view)
    return {
      visitedViews: [...state.visitedViews],
      cachedViews: [...state.cachedViews]
    }
  },
  delVisitedView({ state, commit }: ActionContext<ViewState, unknown>, view: _RouteLocationBase) {
    return new Promise((resolve) => {
      commit('DEL_VISITED_VIEW', view)
      commit('DEL_VIEW_TITLE', view)
      resolve([...state.visitedViews])
    })
  },
  delCachedView({ state, commit }: ActionContext<ViewState, unknown>, view: _RouteLocationBase) {
    return new Promise((resolve) => {
      commit('DEL_CACHED_VIEW', view)
      resolve([...state.cachedViews])
    })
  },
  async delOthersViews({ state, dispatch }: ActionContext<ViewState, unknown>, view: _RouteLocationBase) {
    await dispatch('delOthersVisitedViews', view)
    await dispatch('delOthersCachedViews', view)
    return {
      visitedViews: [...state.visitedViews],
      cachedViews: [...state.cachedViews]
    }
  },
  delOthersVisitedViews({ state, commit }: ActionContext<ViewState, unknown>, view: _RouteLocationBase) {
    return new Promise((resolve) => {
      commit('DEL_OTHERS_VISITED_VIEWS', view)
      commit('UPDATE_VIEW_TITLE')
      resolve([...state.visitedViews])
    })
  },
  delOthersCachedViews({ state, commit }: ActionContext<ViewState, unknown>, view: _RouteLocationBase) {
    return new Promise((resolve) => {
      commit('DEL_OTHERS_CACHED_VIEWS', view)
      resolve([...state.cachedViews])
    })
  },
  async delAllViews({ state, dispatch }: ActionContext<ViewState, unknown>, view: _RouteLocationBase) {
    await dispatch('delAllVisitedViews', view)
    await dispatch('delAllCachedViews', view)
    return {
      visitedViews: [...state.visitedViews],
      cachedViews: [...state.cachedViews]
    }
  },
  delAllVisitedViews({ state, commit }: ActionContext<ViewState, unknown>) {
    return new Promise((resolve) => {
      commit('DEL_ALL_VISITED_VIEWS')
      commit('UPDATE_VIEW_TITLE')
      resolve([...state.visitedViews])
    })
  },
  delAllCachedViews({ state, commit }: ActionContext<ViewState, unknown>) {
    return new Promise((resolve) => {
      commit('DEL_ALL_CACHED_VIEWS')
      resolve([...state.cachedViews])
    })
  },
  updateVisitedView({ commit }: ActionContext<ViewState, unknown>, view: _RouteLocationBase) {
    commit('UPDATE_VISITED_VIEW', view)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
