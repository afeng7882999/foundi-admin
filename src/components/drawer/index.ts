import { App } from 'vue'
import FdDrawer from './drawer.vue'

export default function install(app: App) {
  app.component(FdDrawer.name, FdDrawer)
}
