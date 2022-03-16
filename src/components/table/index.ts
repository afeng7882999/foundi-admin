import { App } from 'vue'
import FdTableSortHeader from './components/sort-header.vue'

import FdColAct from './components/col-act.vue'
import FdColCustom from './components/col-custom.vue'
import FdColDatetime from './components/col-datetime.vue'
import FdCol from './components/col.vue'
import FdColDict from './components/col-dict.vue'
import FdColIcon from './components/col-icon.vue'
import FdColSelection from './components/col-selection.vue'

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
