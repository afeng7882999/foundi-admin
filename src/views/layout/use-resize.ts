import { computed } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { DeviceType } from '@/store/modules/app'

const { body } = document
const WIDTH = 1024
const RATIO = 3
const TITLE_HEIGHT = 48
const TAB_HEIGHT = 48
const TITLE_PADDING = 8
const SIDEBAR_MINI_WIDTH = 56
const SIDEBAR_NORMAL_WIDTH = 240

export default function useLayoutResize() {
  let bodyRect = {
    height: 0,
    width: 0,
    x: 0,
    y: 0
  } as DOMRect

  const store = useStore<AllState>()
  const storeState = store.state as AllState

  const device = computed(() => {
    return storeState.app.device
  })

  const addResizeListener = () => {
    window.addEventListener('resize', resizeLayout)
  }

  const resizeLayout = async () => {
    if (!document.hidden) {
      bodyRect = body.getBoundingClientRect()
      await store.dispatch('app/setBodyHeight', bodyRect.height)
      await store.dispatch('app/setBodyWidth', bodyRect.width)
      await store.dispatch('app/setDocHeight', getDocHeight())
      await store.dispatch('app/setDocWidth', getDocWidth())
      if (isMobile()) {
        await store.dispatch('app/toggleDevice', DeviceType.Mobile)
        await store.dispatch('app/setSidebarMode', { offScreen: true, opened: false })
      } else {
        await store.dispatch('app/toggleDevice', DeviceType.Desktop)
        await store.dispatch('app/setSidebarMode', { offScreen: false, opened: false })
      }
    }
  }

  const getDocHeight = () => {
    const height = storeState.app.enableTags ? TAB_HEIGHT + TITLE_HEIGHT + TITLE_PADDING : TITLE_HEIGHT + TITLE_PADDING
    return bodyRect.height - height
  }

  const getDocWidth = () => {
    if (storeState.app.sidebarMode?.offScreen) {
      return bodyRect.width
    }
    if (storeState.app.sidebarMode?.minimized) {
      return bodyRect.width - SIDEBAR_MINI_WIDTH
    }
    return bodyRect.width - SIDEBAR_NORMAL_WIDTH
  }

  const isMobile = () => {
    return bodyRect.width - RATIO < WIDTH
  }

  return {
    device,
    addResizeListener,
    resizeLayout,
    getDocHeight,
    getDocWidth,
    isMobile
  }
}
