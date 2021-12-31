import { App } from 'vue'
import FdTableSortHeader from './table-sort-header.vue'

export default function install(app: App) {
  app.component(FdTableSortHeader.name, FdTableSortHeader)
}
