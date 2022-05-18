import { App } from 'vue'
import FdDescriptionsAct from './descriptions-act.vue'

export default function install(app: App) {
  app.component(FdDescriptionsAct.name, FdDescriptionsAct)
}
