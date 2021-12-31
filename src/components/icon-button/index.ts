import { App } from 'vue'
import FdIconButton from './icon-button.vue'

export default function install(app: App) {
  app.component(FdIconButton.name, FdIconButton)
}
