import { computed } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { DeviceType } from '@/store/modules/app'

const { body } = document
const WIDTH = 1024
const RATIO = 3
const TITLE_HEIGHT = 50
const TAB_HEIGHT = 50
const TITLE_PADDING = 10
const SIDEBAR_MINI_WIDTH = 56
const SIDEBAR_NORMAL_WIDTH = 250

export default function useLayoutResize() {
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
    const rect = body.getBoundingClientRect()
    const height = storeState.app.enableTags ? TAB_HEIGHT + TITLE_HEIGHT + TITLE_PADDING : TITLE_HEIGHT + TITLE_PADDING
    return rect.height - height
  }

  const getDocWidth = () => {
    const rect = body.getBoundingClientRect()
    if (storeState.app.sidebarMode?.offScreen) {
      return rect.width
    }
    if (storeState.app.sidebarMode?.minimized) {
      return rect.width - SIDEBAR_MINI_WIDTH
    }
    return rect.width - SIDEBAR_NORMAL_WIDTH
  }

  const isMobile = () => {
    const rect = body.getBoundingClientRect()
    return rect.width - RATIO < WIDTH
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
