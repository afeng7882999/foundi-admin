import { App } from 'vue'
import ids from 'virtual:svg-icons-names'
import FdIcon from './icon.vue'

export function getNameList() {
  return ids
    .filter((item: string) => item.startsWith('svg-icons-'))
    .map((item: string) => item.replace('svg-icons-', ''))
}

export default function install(app: App) {
  getNameList()
  app.component(FdIcon.name, FdIcon)
}
