import { createApp } from 'vue'
import App from './App.vue'
import { setupRouter } from './router'
import store from './store'
import 'virtual:svg-icons-register'

import 'normalize.css/normalize.css'
import '@/assets/style/index.scss'
import '@/assets/css/vivify.min.css'

import setupElementPlus from '@/components/element-plus'
import installDirective from '@/directive'
import FdIcon from '@/components/icon'
import FdSvgImage from '@/components/svg-image'
import FdPageHeader from '@/components/page-header'
import FdContextmenu from '@/components/contextmenu'
import FdIconButton from '@/components/icon-button'
import FdTreeSelect from '@/components/tree-select'
import FdDrawer from '@/components/drawer'
import FdTableAll from '@/components/table'

const app = createApp(App)
app.use(store)
setupRouter(app)
setupElementPlus(app)
installDirective(app)
app
  .use(FdIcon)
  .use(FdSvgImage)
  .use(FdPageHeader)
  .use(FdContextmenu)
  .use(FdIconButton)
  .use(FdTreeSelect)
  .use(FdDrawer)
  .use(FdTableAll)

app.mount('#app')
