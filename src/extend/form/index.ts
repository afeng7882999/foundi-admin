import { App } from 'vue'
import FdItemDateRange from './components/item-date-range.vue'
import FdItemDict from './components/item-dict.vue'
import FdItem from './components/item.vue'
import FdItemList from './components/item-list.vue'
import FdItemTree from './components/item-tree.vue'
import FdItemSort from './components/item-sort.vue'
import FdItemJson from './components/item-json.vue'
import FdItemMultiline from './components/item-mutiline.vue'
import FdItemBoolean from './components/item-boolean.vue'

export default function install(app: App) {
  app.component(FdItemDateRange.name, FdItemDateRange)
  app.component(FdItemDict.name, FdItemDict)
  app.component(FdItem.name, FdItem)
  app.component(FdItemList.name, FdItemList)
  app.component(FdItemTree.name, FdItemTree)
  app.component(FdItemSort.name, FdItemSort)
  app.component(FdItemJson.name, FdItemJson)
  app.component(FdItemMultiline.name, FdItemMultiline)
  app.component(FdItemBoolean.name, FdItemBoolean)
}
