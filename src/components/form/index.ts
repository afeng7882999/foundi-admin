import { App } from 'vue'
import FdItemDatetime from './components/item-datetime.vue'
import FdItemDict from './components/item-dict.vue'
import FdItem from './components/item.vue'
import FdItemAct from './components/item-act.vue'
import FdItemList from './components/item-list.vue'
import FdItemTree from './components/item-tree.vue'
import FdItemSort from './components/item-sort.vue'

export default function install(app: App) {
  app.component(FdItemDatetime.name, FdItemDatetime)
  app.component(FdItemDict.name, FdItemDict)
  app.component(FdItem.name, FdItem)
  app.component(FdItemAct.name, FdItemAct)
  app.component(FdItemList.name, FdItemList)
  app.component(FdItemTree.name, FdItemTree)
  app.component(FdItemSort.name, FdItemSort)
}
