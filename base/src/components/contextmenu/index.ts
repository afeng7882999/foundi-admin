// https://github.com/snokier/v-contextmenu
import { App } from 'vue'
import FdContextmenu from './contextmenu.vue'
import FdContextmenuItem from './item.vue'
import FdContextmenuSubmenu from './submenu.vue'

export default function install(app: App) {
  app.component(FdContextmenu.name, FdContextmenu)
  app.component(FdContextmenuItem.name, FdContextmenuItem)
  app.component(FdContextmenuSubmenu.name, FdContextmenuSubmenu)
}
