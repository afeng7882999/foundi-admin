import { App } from 'vue'
import FdTableSortHeader from './components/sort-header.vue'
import FdTableSetting from './components/table-setting.vue'

import FdActCol from './components/column/act-col.vue'
import FdCustomCol from './components/column/custom-col.vue'
import FdDatetimeCol from './components/column/datetime-col.vue'
import FdCol from './components/column/default-col.vue'
import FdDictCol from './components/column/dict-col.vue'
import FdIconCol from './components/column/icon-col.vue'
import FdSelectionCol from './components/column/selection-col.vue'

export default function install(app: App) {
  app.component(FdTableSortHeader.name, FdTableSortHeader)
  app.component(FdTableSetting.name, FdTableSetting)

  app.component(FdActCol.name, FdActCol)
  app.component(FdCustomCol.name, FdCustomCol)
  app.component(FdDatetimeCol.name, FdDatetimeCol)
  app.component(FdCol.name, FdCol)
  app.component(FdDictCol.name, FdDictCol)
  app.component(FdIconCol.name, FdIconCol)
  app.component(FdSelectionCol.name, FdSelectionCol)
}
