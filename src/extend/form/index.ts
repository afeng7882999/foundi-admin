import { App } from 'vue'
import FdForm from './form.vue'

export default function install(app: App) {
  app.component(FdForm.name, FdForm)
}
