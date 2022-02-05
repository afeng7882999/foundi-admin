import { App } from 'vue'
import FdColumn from './column.vue'
import FdTableSortHeader from './sort-header.vue'

export default function install(app: App) {
  app.component(FdColumn.name, FdColumn)
  app.component(FdTableSortHeader.name, FdTableSortHeader)
}
