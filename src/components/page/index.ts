import { App } from 'vue'
import FdPageAct from '@/components/page/page-act.vue'
import FdPageQuery from '@/components/page/page-query.vue'

export default function install(app: App) {
  app.component(FdPageAct.name, FdPageAct)
  app.component(FdPageQuery.name, FdPageQuery)
}
