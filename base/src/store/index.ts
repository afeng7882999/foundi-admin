import { createStore, Store } from 'vuex'
import app, { AppState } from '@b/store/modules/app'
import router, { RouterState } from '@b/store/modules/router'
import user, { UserState } from '@b/store/modules/user'
import view, { ViewState } from '@b/store/modules/view'
import { InjectionKey } from 'vue'

export interface BaseState {
  app: AppState
  router: RouterState
  user: UserState
  view: ViewState
}

export default createStore<BaseState>({
  modules: {
    app,
    router,
    user,
    view
  }
})
