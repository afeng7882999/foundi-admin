import WavesDirective from './waves'
import DragDialogDirective from './drag-dialog'
import { App } from 'vue'

export default function installDirective(app: App): void {
  app.directive('waves', WavesDirective)
  app.directive('drag-dialog', DragDialogDirective)
}
