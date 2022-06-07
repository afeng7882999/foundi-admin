import { App } from 'vue'
import FdVirtualGrid from './virtual-grid.vue'

export default function install(app: App) {
  app.component(FdVirtualGrid.name, FdVirtualGrid)
}
