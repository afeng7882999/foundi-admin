import { useEventBus } from '@vueuse/core'

export interface BusEvent {
  event: PointerEvent
  id: string
}

const FdPopperShowEvent = Symbol('fd-popper-show')
const bus = useEventBus<BusEvent>(FdPopperShowEvent)

export default bus
