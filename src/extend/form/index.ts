import { App } from 'vue'
import FdFmiDateRange from './components/item-date-range.vue'
import FdFmiDict from './components/item-dict.vue'
import FdFmi from './components/item.vue'
import FdFmiList from './components/item-list.vue'
import FdFmiTree from './components/item-tree.vue'
import FdFmiSort from './components/item-sort.vue'
import FdFmiJson from './components/item-json.vue'
import FdFmiMultiline from './components/item-mutiline.vue'
import FdFmiBoolean from './components/item-boolean.vue'

export default function install(app: App) {
  app.component(FdFmiDateRange.name, FdFmiDateRange)
  app.component(FdFmiDict.name, FdFmiDict)
  app.component(FdFmi.name, FdFmi)
  app.component(FdFmiList.name, FdFmiList)
  app.component(FdFmiTree.name, FdFmiTree)
  app.component(FdFmiSort.name, FdFmiSort)
  app.component(FdFmiJson.name, FdFmiJson)
  app.component(FdFmiMultiline.name, FdFmiMultiline)
  app.component(FdFmiBoolean.name, FdFmiBoolean)
}
