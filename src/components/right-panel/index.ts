import { App } from 'vue'
import FdRightPanel from './right-panel.vue'

export default function install(app: App) {
  app.component(FdRightPanel.name, FdRightPanel)
}
