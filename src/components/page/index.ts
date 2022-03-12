import { App } from 'vue'
import FdPage from '@/components/page/page.vue'
import FdPageAct from '@/components/page/page-act.vue'
import FdPageQuery from '@/components/page/page-query.vue'
import FdPageFooter from '@/components/page/page-footer.vue'

export default function install(app: App) {
  app.component(FdPage.name, FdPage)
  app.component(FdPageAct.name, FdPageAct)
  app.component(FdPageQuery.name, FdPageQuery)
  app.component(FdPageFooter.name, FdPageFooter)
}
