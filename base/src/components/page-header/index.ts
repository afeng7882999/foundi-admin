import { App } from 'vue'
import FdPageHeader from './page-header.vue'

export default function install(app: App) {
  app.component(FdPageHeader.name, FdPageHeader)
}
