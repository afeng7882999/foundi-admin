import { createStore } from 'vuex'
import app, { AppState } from '@/store/modules/app'
import router, { RouterState } from '@/store/modules/router'
import user, { UserState } from '@/store/modules/user'
import view, { ViewState } from '@/store/modules/view'
import table, { TableState } from '@/store/modules/table'

export interface AllState {
  app: AppState
  router: RouterState
  user: UserState
  view: ViewState
  table: TableState
}

export default createStore<AllState>({
  modules: {
    app,
    router,
    user,
    view,
    table
  }
})
