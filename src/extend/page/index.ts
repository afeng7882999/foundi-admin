import { App } from 'vue'
import FdPage from '@/extend/page/page.vue'
import FdPageToolbar from '@/extend/page/page-toolbar.vue'
import FdPageFooter from '@/extend/page/page-footer.vue'

export default function install(app: App) {
  app.component(FdPage.name, FdPage)
  app.component(FdPageToolbar.name, FdPageToolbar)
  app.component(FdPageFooter.name, FdPageFooter)
}
