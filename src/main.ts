import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import { setupRouter } from './router'
import 'virtual:svg-icons-register'

import 'normalize.css/normalize.css'
import '@/assets/style/index.scss'
import '@/assets/css/vivify.min.css'

import { isMobileDevice } from '@/hooks/use-layout-size'
import installElementPlus from '@/components/element-plus'
import installVant from '@/components/vant'

import installDirective from '@/directive'
import FdIcon from '@/components/icon'
import FdSvgImage from '@/components/svg-image'
import FdPageHeader from '@/components/page-header'
import FdContextmenu from '@/components/contextmenu'
import FdTreeSelect from '@/components/tree-select'
import FdFmtAll from '@/components/formatter'
import FdTableAll from '@/components/table'
import FdFormAll from '@/components/form'
import FdButtonAll from '@/components/button'
import FdDescriptionsAll from '@/components/descriptions'
import FdVirtualGrid from '@/components/virtual-grid'
import FdCardAll from '@/components/card'
import FdDialog from '@/components/dialog'
import FdDrawer from '@/components/drawer'
import FdPageAll from '@/crud/page'

const app = createApp(App)
app.use(store)
setupRouter(app)
installVant(app)
installElementPlus(app)
installDirective(app)
app
  .use(FdIcon)
  .use(FdSvgImage)
  .use(FdPageHeader)
  .use(FdContextmenu)
  .use(FdTreeSelect)
  .use(FdFmtAll)
  .use(FdTableAll)
  .use(FdFormAll)
  .use(FdButtonAll)
  .use(FdDescriptionsAll)
  .use(FdVirtualGrid)
  .use(FdCardAll)
  .use(FdDialog)
  .use(FdDrawer)
  .use(FdPageAll)

app.mount('#app')
