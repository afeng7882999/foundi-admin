import { App } from 'vue'
import FdPageMain from '@/components/page/page-main.vue'
import FdPageAct from '@/components/page/page-act.vue'
import FdPageQuery from '@/components/page/page-query.vue'

export default function install(app: App) {
  app.component(FdPageMain.name, FdPageMain)
  app.component(FdPageAct.name, FdPageAct)
  app.component(FdPageQuery.name, FdPageQuery)
}
