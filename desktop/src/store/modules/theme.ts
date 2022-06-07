/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { setDocumentTheme, Theme } from '@/components/theme/theme'
import { ActionContext } from 'vuex'

export interface ThemeState {
  theme: Theme | null
}

const state: ThemeState = {
  theme: JSON.parse(window.localStorage.getItem('app.theme') || '{}')
}

const mutations = {
  SET_THEME: (state: ThemeState, theme: Theme) => {
    state.theme = theme
    setDocumentTheme(state.theme)
    window.localStorage.setItem('app.theme', JSON.stringify(state.theme))
  },
  RESET_THEME: (state: ThemeState) => {
    state.theme = {}
    window.localStorage.removeItem('app.theme')
  }
}

const actions = {
  setTheme({ commit }: ActionContext<ThemeState, unknown>, theme: Theme) {
    commit('SET_THEME', theme)
  },
  resetTheme({ commit }: ActionContext<ThemeState, unknown>) {
    commit('RESET_Theme')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
