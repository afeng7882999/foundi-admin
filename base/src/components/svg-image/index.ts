import { App } from 'vue'
import FdSvgImage from './svg-image.vue'

export default function install(app: App) {
  app.component(FdSvgImage.name, FdSvgImage)
}
