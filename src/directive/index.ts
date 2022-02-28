import WavesDirective from './waves'
import { vLoading } from './loading'
import { App } from 'vue'

export default function installDirective(app: App): void {
  app.directive('waves', WavesDirective)
  app.directive('loading', vLoading)
}
