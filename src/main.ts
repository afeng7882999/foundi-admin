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
import FdTreeSelect from '@/components/tree-select'
import FdTableAll from '@/components/table'
import FdFormAll from '@/components/form'
import FdButtonAll from '@/components/button'
import FdVirtualGrid from '@/components/virtual-grid'

import FdForm from '@/extend/form'
import FdDialog from '@/extend/dialog'
import FdDrawer from '@/extend/drawer'
import FdDescriptionsAll from '@/extend/descriptions'

import FdPageAll from '@/crud/page'

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
  .use(FdTreeSelect)
  .use(FdTableAll)
  .use(FdFormAll)
  .use(FdButtonAll)
  .use(FdVirtualGrid)
  .use(FdForm)
  .use(FdDialog)
  .use(FdDrawer)
  .use(FdDescriptionsAll)
  .use(FdPageAll)

app.mount('#app')
