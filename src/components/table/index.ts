import { App } from 'vue'
import FdColumn from './column.vue'

export default function install(app: App) {
  app.component(FdColumn.name, FdColumn)
}
