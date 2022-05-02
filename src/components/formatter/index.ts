import { App } from 'vue'
import FdFmtDatetime from './fmt-datetime.vue'
import FdFmtDict from './fmt-dict.vue'
import FdFmtIcon from './fmt-icon.vue'
import FdFmtJson from './fmt-json.vue'
import FdFmtList from './fmt-list.vue'
import FdFmtBoolean from './fmt-boolean.vue'

export default function install(app: App) {
  app.component(FdFmtDatetime.name, FdFmtDatetime)
  app.component(FdFmtDict.name, FdFmtDict)
  app.component(FdFmtIcon.name, FdFmtIcon)
  app.component(FdFmtJson.name, FdFmtJson)
  app.component(FdFmtList.name, FdFmtList)
  app.component(FdFmtBoolean.name, FdFmtBoolean)
}
