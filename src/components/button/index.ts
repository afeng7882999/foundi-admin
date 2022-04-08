import { App } from 'vue'
import FdButton from './button.vue'

export default function install(app: App) {
  app.component(FdButton.name, FdButton)
}
