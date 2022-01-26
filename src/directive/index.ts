import WavesDirective from './waves'
import { App } from 'vue'

export default function installDirective(app: App): void {
  app.directive('waves', WavesDirective)
}
