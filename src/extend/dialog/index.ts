import { App } from 'vue'
import FdDialog from './dialog.vue'

export default function install(app: App) {
  app.component(FdDialog.name, FdDialog)
}
