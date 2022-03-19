import { computed } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { DeviceType } from '@/store/modules/app'
import { breakpoints } from '@/common/breakpoint'

export const resizeConst = {
  ratio: 3,
  titleHeight: 48,
  tabHeight: 48,
  titlePadding: 8,
  sidebarMiniWidth: 56,
  sidebarNormalWidth: 240,
  footerHeight: 48,
  pageHeaderHeight: 48
}

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
      bodyRect = document.body.getBoundingClientRect()
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
    const height = storeState.app.enableTags
      ? resizeConst.tabHeight + resizeConst.titleHeight + resizeConst.titlePadding
      : resizeConst.titleHeight + resizeConst.titlePadding
    return bodyRect.height - height
  }

  const getDocWidth = () => {
    if (storeState.app.sidebarMode?.offScreen) {
      return bodyRect.width
    }
    if (storeState.app.sidebarMode?.minimized) {
      return bodyRect.width - resizeConst.sidebarMiniWidth
    }
    return bodyRect.width - resizeConst.sidebarNormalWidth
  }

  const isMobile = () => {
    return bodyRect.width - resizeConst.ratio < breakpoints.md
  }

  return {
    device,
    addResizeListener,
    resizeLayout
  }
}
