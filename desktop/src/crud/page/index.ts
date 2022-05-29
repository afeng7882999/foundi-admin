import { App } from 'vue'
import FdPage from './page.vue'
import FdPageToolbar from './page-toolbar.vue'
import FdPageFooter from './page-footer.vue'

export default function install(app: App) {
  app.component(FdPage.name, FdPage)
  app.component(FdPageToolbar.name, FdPageToolbar)
  app.component(FdPageFooter.name, FdPageFooter)
}
