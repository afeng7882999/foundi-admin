import { App } from 'vue'
import FdDescriptions from './descriptions.vue'
import FdDescriptionsAct from './descriptions-act.vue'

export default function install(app: App) {
  app.component(FdDescriptions.name, FdDescriptions)
  app.component(FdDescriptionsAct.name, FdDescriptionsAct)
}
