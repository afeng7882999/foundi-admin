import { App } from 'vue'
import FdDetailCard from './detail/card.vue'
import FdDetialCardItem from './detail/card-item.vue'

export default function install(app: App) {
  app.component(FdDetailCard.name, FdDetailCard)
  app.component(FdDetialCardItem.name, FdDetialCardItem)
}
