import store, {BaseState, storeKey} from '@b/store'
import table, { TableState } from '@/store/modules/table'
import theme, { ThemeState } from '@/store/modules/theme'
import { InjectionKey } from 'vue'
import { Store, useStore as _useStore } from 'vuex'

export type AllState = BaseState & {
  table: TableState
  theme: ThemeState
}

store.registerModule('table', table)
store.registerModule('theme', theme)

export function useStore() {
  return _useStore<AllState>(storeKey)
}

export default store
