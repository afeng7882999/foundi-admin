import { App } from 'vue'
import FdTableSortHeader from './components/sort-header.vue'

import FdColAct from './components/column/col-act.vue'
import FdColCustom from './components/column/col-custom.vue'
import FdColDatetime from './components/column/col-datetime.vue'
import FdCol from './components/column/col.vue'
import FdColDict from './components/column/col-dict.vue'
import FdColIcon from './components/column/col-icon.vue'
import FdColSelection from './components/column/col-selection.vue'

export default function install(app: App) {
  app.component(FdTableSortHeader.name, FdTableSortHeader)

  app.component(FdColAct.name, FdColAct)
  app.component(FdColCustom.name, FdColCustom)
  app.component(FdColDatetime.name, FdColDatetime)
  app.component(FdCol.name, FdCol)
  app.component(FdColDict.name, FdColDict)
  app.component(FdColIcon.name, FdColIcon)
  app.component(FdColSelection.name, FdColSelection)
}
