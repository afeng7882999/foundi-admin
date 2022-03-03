import { App } from 'vue'
import FdPageAct from '@/components/page/page-act.vue'

export default function install(app: App) {
  app.component(FdPageAct.name, FdPageAct)
}
