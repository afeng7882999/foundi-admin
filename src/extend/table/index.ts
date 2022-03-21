import { App } from 'vue'
import FdTableSortHeader from './components/sort-header.vue'

import FdFmtDatetime from './formatter/fmt-datetime.vue'
import FdFmtDict from './formatter/fmt-dict.vue'
import FdFmtIcon from './formatter/fmt-icon.vue'
import FdFmtJson from './formatter/fmt-json.vue'
import FdFmtList from './formatter/fmt-list.vue'
import FdFmtBoolean from './formatter/fmt-boolean.vue'

import FdColAct from './column/col-act.vue'
import FdColCustom from './column/col-custom.vue'
import FdColDatetime from './column/col-datetime.vue'
import FdCol from './column/col.vue'
import FdColDict from './column/col-dict.vue'
import FdColIcon from './column/col-icon.vue'
import FdColList from './column/col-list.vue'
import FdColSelection from './column/col-selection.vue'

export default function install(app: App) {
  app.component(FdTableSortHeader.name, FdTableSortHeader)

  app.component(FdFmtDatetime.name, FdFmtDatetime)
  app.component(FdFmtDict.name, FdFmtDict)
  app.component(FdFmtIcon.name, FdFmtIcon)
  app.component(FdFmtJson.name, FdFmtJson)
  app.component(FdFmtList.name, FdFmtList)
  app.component(FdFmtBoolean.name, FdFmtBoolean)

  app.component(FdColAct.name, FdColAct)
  app.component(FdColCustom.name, FdColCustom)
  app.component(FdColDatetime.name, FdColDatetime)
  app.component(FdCol.name, FdCol)
  app.component(FdColDict.name, FdColDict)
  app.component(FdColIcon.name, FdColIcon)
  app.component(FdColList.name, FdColList)
  app.component(FdColSelection.name, FdColSelection)
}
