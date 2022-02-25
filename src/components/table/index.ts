import { App } from 'vue'
import FdColumn from './components/column.vue'
import FdTableSortHeader from './components/sort-header.vue'

export default function install(app: App) {
  app.component(FdColumn.name, FdColumn)
  app.component(FdTableSortHeader.name, FdTableSortHeader)
}
