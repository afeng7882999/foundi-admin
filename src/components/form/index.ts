import { App } from 'vue'
import FdItemDatetime from './components/form-item/item-datetime.vue'
import FdItemDict from './components/form-item/item-dict.vue'
import FdItem from './components/form-item/item.vue'
import FdItemAct from './components/form-item/item-act.vue'
import FdItemList from './components/form-item/item-list.vue'
import FdItemTree from './components/form-item/item-tree.vue'
import FdItemSort from './components/form-item/item-sort.vue'

export default function install(app: App) {
  app.component(FdItemDatetime.name, FdItemDatetime)
  app.component(FdItemDict.name, FdItemDict)
  app.component(FdItem.name, FdItem)
  app.component(FdItemAct.name, FdItemAct)
  app.component(FdItemList.name, FdItemList)
  app.component(FdItemTree.name, FdItemTree)
  app.component(FdItemSort.name, FdItemSort)
}
