import { App } from 'vue'
import FdPage from '@/extend/page/page.vue'
import FdPageAct from '@/extend/page/page-act.vue'
import FdPageQuery from '@/extend/page/page-query.vue'
import FdPageFooter from '@/extend/page/page-footer.vue'
import FdPageModal from '@/extend/page/page-modal.vue'

export default function install(app: App) {
  app.component(FdPage.name, FdPage)
  app.component(FdPageAct.name, FdPageAct)
  app.component(FdPageQuery.name, FdPageQuery)
  app.component(FdPageFooter.name, FdPageFooter)
  app.component(FdPageModal.name, FdPageModal)
}
