import store, { BaseState } from '@b/store'
import table, { TableState } from '@/store/modules/table'
import theme, { ThemeState } from '@/store/modules/theme'
import { Store, useStore as _useStore } from 'vuex'
import { InjectionKey } from 'vue'

export type AllState = BaseState & {
  table: TableState
  theme: ThemeState
}

export const storeKey: InjectionKey<Store<AllState>> = Symbol('foundi-admin-store')

store.registerModule('table', table)
store.registerModule('theme', theme)

export function useStore() {
  return _useStore<AllState>(storeKey)
}

console.log('store', store, useStore())

export default store as Store<AllState>
