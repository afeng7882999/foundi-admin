import { App } from 'vue'
import FdTreeSelect from './tree-select.vue'

export default function install(app: App) {
  app.component(FdTreeSelect.name, FdTreeSelect)
}
