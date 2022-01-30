import { App } from 'vue'
import FdCol from './col.vue'

export default function install(app: App) {
  app.component(FdCol.name, FdCol)
}
