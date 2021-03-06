/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ActionContext } from 'vuex'
import Cookies from 'js-cookie'
import config from '@b/app/settings'
import { TreeNodeDefault } from '@b/utils/data-tree'
import { User } from '@b/api/system/user'
import { Role } from '@b/api/system/role'

const TokenKey = config.TokenKey
export const DEFAULT_AVATAR = '/static/img/default-user-icon.png'
const DEFAULT_USER = '{"username":"","avatar":"' + DEFAULT_AVATAR + '"}'

export interface UserState {
  token?: string
  user: User
  roles?: Role[]
  menu?: TreeNodeDefault[]
  perms?: string[]
}

const state: UserState = {
  token: Cookies.get(TokenKey),
  user: JSON.parse(window.localStorage.getItem('user') || DEFAULT_USER),
  roles: JSON.parse(window.localStorage.getItem('user.roles') || '[]'),
  menu: JSON.parse(window.localStorage.getItem('user.menu') || '[]'),
  perms: JSON.parse(window.localStorage.getItem('user.perms') || '[]')
}

const mutations = {
  SET_TOKEN: (state: UserState, token: string) => {
    state.token = token
    Cookies.set(TokenKey, token, { expires: config.tokenCookieExpires })
  },
  REMOVE_TOKEN(state: UserState) {
    state.token = ''
    Cookies.remove(TokenKey)
  },
  SET_USER: (state: UserState, user: User) => {
    state.user = user
    if (!state.user.avatar) {
      state.user.avatar = DEFAULT_AVATAR
    }
    window.localStorage.setItem('user', JSON.stringify(user))
  },
  SET_ROLES: (state: UserState, roles: Role[]) => {
    state.roles = roles
    window.localStorage.setItem('user.roles', JSON.stringify(roles))
  },
  SET_PERMS: (state: UserState, perms: string[]) => {
    state.perms = perms
    window.localStorage.setItem('user.perms', JSON.stringify(perms))
  },
  SET_MENU: (state: UserState, menu: TreeNodeDefault[]) => {
    state.menu = menu
    window.localStorage.setItem('user.menu', JSON.stringify(menu))
  },
  CLEAR_USER: (state: UserState) => {
    state.token = ''
    state.user = JSON.parse(DEFAULT_USER)
    state.roles = []
    state.menu = []
    state.perms = []
    Cookies.remove(TokenKey)
    window.localStorage.removeItem('user')
    window.localStorage.removeItem('user.roles')
    window.localStorage.removeItem('user.menu')
    window.localStorage.removeItem('user.perms')
    window.localStorage.removeItem('user.routes')
  }
}

const actions = {
  setToken({ commit }: ActionContext<UserState, unknown>, token: string) {
    commit('SET_TOKEN', token)
  },
  removeToken({ commit }: ActionContext<UserState, unknown>) {
    commit('REMOVE_TOKEN')
  },
  setUser({ commit }: ActionContext<UserState, unknown>, user: User) {
    commit('SET_USER', user)
  },
  setRoles({ commit }: ActionContext<UserState, unknown>, roles: Role[]) {
    commit('SET_ROLES', roles)
  },
  setPerms({ commit }: ActionContext<UserState, unknown>, perms: string[]) {
    commit('SET_PERMS', perms)
  },
  setMenu({ commit }: ActionContext<UserState, unknown>, menu: TreeNodeDefault[]) {
    commit('SET_MENU', menu)
  },
  setUserInfo(
    { commit }: ActionContext<UserState, unknown>,
    info: { user: User; roles: string[]; perms: string[]; menu: TreeNodeDefault[] }
  ) {
    commit('SET_USER', info.user)
    commit('SET_ROLES', info.roles)
    commit('SET_PERMS', info.perms)
    commit('SET_MENU', info.menu)
  },
  clearUser({ commit }: ActionContext<UserState, unknown>) {
    commit('CLEAR_USER')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
