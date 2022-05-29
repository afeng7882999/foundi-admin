import { App } from 'vue'
import FdTableSortHeader from './components/sort-header.vue'

import FdColAct from './column/col-act.vue'
import FdColCustom from './column/col-custom.vue'
import FdColDatetime from './column/col-datetime.vue'
import FdCol from './column/col.vue'
import FdColDict from './column/col-dict.vue'
import FdColIcon from './column/col-icon.vue'
import FdColList from './column/col-list.vue'
import FdColBoolean from './column/col-boolean.vue'
import FdColSelection from './column/col-selection.vue'

export default function install(app: App) {
  app.component(FdTableSortHeader.name, FdTableSortHeader)

  app.component(FdColAct.name, FdColAct)
  app.component(FdColCustom.name, FdColCustom)
  app.component(FdColDatetime.name, FdColDatetime)
  app.component(FdCol.name, FdCol)
  app.component(FdColDict.name, FdColDict)
  app.component(FdColIcon.name, FdColIcon)
  app.component(FdColList.name, FdColList)
  app.component(FdColBoolean.name, FdColBoolean)
  app.component(FdColSelection.name, FdColSelection)
}
