/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ActionContext } from 'vuex'
import { getDeviceSize } from '@b/hooks/use-layout-size'

const DEFAULT_SIDEBAR_MODE = '{"minimized":false,"offScreen":false,"opened":false,"useGrouped":true,"showLogo":true,"showUser":true}'

export enum DeviceType {
  Mobile,
  Pad,
  Desktop
}

export interface SidebarMode {
  minimized?: boolean
  offScreen?: boolean
  opened?: boolean
  useGroup?: boolean
  showLogo?: boolean
  showUser?: boolean
}

export interface AppState {
  title: string
  icon: string
  bodyHeight: number
  bodyWidth: number
  docHeight: number
  docWidth: number
  deviceSize: DeviceType
  sidebarMode: SidebarMode | null
  enableTags: boolean
  showBreadcrumb: boolean
  fixedHeader: boolean
}

const state: AppState = {
  title: 'foundi-admin',
  icon: 'infinity',
  bodyHeight: 0,
  bodyWidth: 0,
  docHeight: 0,
  docWidth: 0,
  deviceSize: getDeviceSize(),
  sidebarMode: JSON.parse(window.localStorage.getItem('app.sidebarMode') || DEFAULT_SIDEBAR_MODE),
  enableTags: window.localStorage.getItem('app.enableTags') ? window.localStorage.getItem('app.enableTags') === 'true' : true,
  showBreadcrumb: window.localStorage.getItem('app.showBreadcrumb') ? window.localStorage.getItem('app.showBreadcrumb') === 'true' : false,
  fixedHeader: window.localStorage.getItem('app.fixedHeader') ? window.localStorage.getItem('app.fixedHeader') === 'true' : true
}

const mutations = {
  SET_TITLE: (state: AppState, title: string) => {
    state.title = title
  },
  SET_ICON: (state: AppState, icon: string) => {
    state.icon = icon
  },
  SET_BODY_HEIGHT: (state: AppState, height: number) => {
    state.bodyHeight = height
  },
  SET_BODY_WIDTH: (state: AppState, width: number) => {
    state.bodyWidth = width
  },
  SET_DOC_HEIGHT: (state: AppState, height: number) => {
    state.docHeight = height
  },
  SET_DOC_WIDTH: (state: AppState, width: number) => {
    state.docWidth = width
  },
  TOGGLE_DEVICE_SIZE: (state: AppState, deviceSize: DeviceType) => {
    state.deviceSize = deviceSize
  },
  SET_SIDEBAR_MODE: (state: AppState, mode: SidebarMode) => {
    state.sidebarMode = Object.assign({}, state.sidebarMode, mode)
    window.localStorage.setItem('app.sidebarMode', JSON.stringify(state.sidebarMode))
  },
  SET_ENABLE_TAGS: (state: AppState, enabled: boolean) => {
    state.enableTags = enabled
    window.localStorage.setItem('app.enableTags', enabled ? 'true' : 'false')
  },
  SET_SHOW_BREADCRUMB: (state: AppState, showed: boolean) => {
    state.showBreadcrumb = showed
    window.localStorage.setItem('app.showBreadcrumb', showed ? 'true' : 'false')
  },
  SET_FIXED_HEADER: (state: AppState, enabled: boolean) => {
    state.fixedHeader = enabled
    window.localStorage.setItem('app.fixedHeader', enabled ? 'true' : 'false')
  },
  RESET_APP: (state: AppState) => {
    state.sidebarMode = JSON.parse(DEFAULT_SIDEBAR_MODE)
    state.enableTags = false
    state.showBreadcrumb = false
    state.fixedHeader = false
    window.localStorage.removeItem('app.sidebarMode')
    window.localStorage.removeItem('app.enableTags')
    window.localStorage.removeItem('app.showBreadcrumb')
    window.localStorage.removeItem('app.fixedHeader')
  }
}

const actions = {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  setBodyHeight({ commit }: ActionContext<AppState, unknown>, height: number) {
    commit('SET_BODY_HEIGHT', height)
  },
  setBodyWidth({ commit }: ActionContext<AppState, unknown>, width: number) {
    commit('SET_BODY_WIDTH', width)
  },
  setDocHeight({ commit }: ActionContext<AppState, unknown>, height: number) {
    commit('SET_DOC_HEIGHT', height)
  },
  setDocWidth({ commit }: ActionContext<AppState, unknown>, width: number) {
    commit('SET_DOC_WIDTH', width)
  },
  toggleDeviceSize({ commit }: ActionContext<AppState, unknown>, deviceSize: DeviceType) {
    commit('TOGGLE_DEVICE_SIZE', deviceSize)
  },
  setAppTitle({ commit }: ActionContext<AppState, unknown>, title: string) {
    commit('SET_TITLE', title)
  },
  setAppIcon({ commit }: ActionContext<AppState, unknown>, icon: string) {
    commit('SET_ICON', icon)
  },
  setSidebarMode({ commit }: ActionContext<AppState, unknown>, mode: SidebarMode) {
    commit('SET_SIDEBAR_MODE', mode)
  },
  setEnableTags({ commit }: ActionContext<AppState, unknown>, enabled: boolean) {
    commit('SET_ENABLE_TAGS', enabled)
  },
  setShowBreadcrumb({ commit }: ActionContext<AppState, unknown>, showed: boolean) {
    commit('SET_SHOW_BREADCRUMB', showed)
  },
  setFixedHeader({ commit }: ActionContext<AppState, unknown>, enabled: boolean) {
    commit('SET_FIXED_HEADER', enabled)
  },
  resetApp({ commit }: ActionContext<AppState, unknown>) {
    commit('RESET_APP')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
