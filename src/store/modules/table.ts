/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ActionContext } from 'vuex'
import { RowDensity, TABLE_ID_PREFIX, TableColumn } from '@/components/table/types'

export interface TableSetting {
  rowDensity?: RowDensity
  columns?: TableColumn[]
  expandAll?: boolean
  stripe?: boolean
  border?: boolean
}

interface TableSettingItem {
  id: string
  setting: TableSetting
}

export interface TableState {
  settings: TableSettingItem[]
}

const settingsDefault = () => {
  const result = [] as TableSettingItem[]
  for (let i = 0; i < window.localStorage.length; i++) {
    const id = window.localStorage.key(i)
    if (id && id.startsWith(TABLE_ID_PREFIX)) {
      const val = window.localStorage.getItem(id)
      if (val) {
        const item = JSON.parse(val)
        result.push(item)
      }
    }
  }
  return result
}

const setSettings = (state: TableState, id: string, setting: TableSetting) => {
  if (id) {
    let item = state.settings.find((s) => s.id === id)
    if (!item) {
      item = { id, setting: {} } as TableSettingItem
      state.settings.push(item)
    }
    setting.rowDensity && (item.setting.rowDensity = setting.rowDensity)
    setting.columns && (item.setting.columns = setting.columns)
    setting.expandAll !== undefined && (item.setting.expandAll = setting.expandAll)
    setting.stripe !== undefined && (item.setting.stripe = setting.stripe)
    setting.border !== undefined && (item.setting.border = setting.border)
    window.localStorage.setItem(id, JSON.stringify(item))
  }
}

const deleteSettings = (state: TableState, id: string, key: 'rowDensity' | 'columns' | 'expandAll' | 'stripe' | 'border') => {
  if (id) {
    const item = state.settings.find((s) => s.id === id)
    if (item) {
      key === 'rowDensity' && (item.setting.rowDensity = undefined)
      key === 'columns' && (item.setting.columns = undefined)
      key === 'expandAll' && (item.setting.expandAll = undefined)
      key === 'stripe' && (item.setting.stripe = undefined)
      key === 'border' && (item.setting.border = undefined)
      window.localStorage.setItem(id, JSON.stringify(item))
    }
  }
}

const state: TableState = {
  settings: settingsDefault()
}

const mutations = {
  SET_ROW_DENSITY: (state: TableState, params: { id: string; rowDensity: RowDensity }) => {
    setSettings(state, params.id, { rowDensity: params.rowDensity })
  },
  SET_COLUMNS: (state: TableState, params: { id: string; columns: TableColumn[] }) => {
    setSettings(state, params.id, { columns: params.columns })
  },
  SET_EXPAND_ALL: (state: TableState, params: { id: string; expandAll: boolean }) => {
    setSettings(state, params.id, { expandAll: params.expandAll })
  },
  SET_STRIPE: (state: TableState, params: { id: string; stripe: boolean }) => {
    setSettings(state, params.id, { stripe: params.stripe })
  },
  SET_BORDER: (state: TableState, params: { id: string; border: boolean }) => {
    setSettings(state, params.id, { border: params.border })
  },
  DELETE_ROW_DENSITY: (state: TableState, id: string) => {
    deleteSettings(state, id, 'rowDensity')
  },
  DELETE_COLUMNS: (state: TableState, id: string) => {
    deleteSettings(state, id, 'columns')
  },
  DELETE_EXPAND_ALL: (state: TableState, id: string) => {
    deleteSettings(state, id, 'expandAll')
  },
  DELETE_STRIPE: (state: TableState, id: string) => {
    deleteSettings(state, id, 'stripe')
  },
  DELETE_BORDER: (state: TableState, id: string) => {
    deleteSettings(state, id, 'border')
  }
}

const actions = {
  setRowDensity({ commit }: ActionContext<TableState, unknown>, params: { id: string; rowDensity?: RowDensity }) {
    commit('SET_ROW_DENSITY', params)
  },
  setColumns({ commit }: ActionContext<TableState, unknown>, params: { id: string; columns?: TableColumn[] }) {
    commit('SET_COLUMNS', params)
  },
  setExpandAll({ commit }: ActionContext<TableState, unknown>, params: { id: string; expandAll?: boolean }) {
    commit('SET_EXPAND_ALL', params)
  },
  setStripe({ commit }: ActionContext<TableState, unknown>, params: { id: string; stripe?: boolean }) {
    commit('SET_STRIPE', params)
  },
  setBorder({ commit }: ActionContext<TableState, unknown>, params: { id: string; border?: boolean }) {
    commit('SET_BORDER', params)
  },
  deleteRowDensity({ commit }: ActionContext<TableState, unknown>, id: string) {
    commit('DELETE_ROW_DENSITY', id)
  },
  deleteColumns({ commit }: ActionContext<TableState, unknown>, id: string) {
    commit('DELETE_COLUMNS', id)
  },
  deleteExpandAll({ commit }: ActionContext<TableState, unknown>, id: string) {
    commit('DELETE_EXPAND_ALL', id)
  },
  deleteStripe({ commit }: ActionContext<TableState, unknown>, id: string) {
    commit('DELETE_STRIPE', id)
  },
  deleteBorder({ commit }: ActionContext<TableState, unknown>, id: string) {
    commit('DELETE_BORDER', id)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
