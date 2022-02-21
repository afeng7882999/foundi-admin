import { useEventBus } from '@vueuse/core'

export interface BusEvent {
  event: MouseEvent
  id: string
}

const ContextmenuShowEvent = Symbol('show-contextmenu')
const bus = useEventBus<BusEvent>(ContextmenuShowEvent)

export default bus
