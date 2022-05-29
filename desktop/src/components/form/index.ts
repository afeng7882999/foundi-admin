import { App } from 'vue'
import FdItemDateRange from './item/item-date-range.vue'
import FdItemDict from './item/item-dict.vue'
import FdItem from './item/item.vue'
import FdItemList from './item/item-list.vue'
import FdItemTree from './item/item-tree.vue'
import FdItemSort from './item/item-sort.vue'
import FdItemJson from './item/item-json.vue'
import FdItemMultiline from './item/item-mutiline.vue'
import FdItemBoolean from './item/item-boolean.vue'
import FdItemCustom from './item/item-custom.vue'

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
  app.component(FdItemCustom.name, FdItemCustom)
}
