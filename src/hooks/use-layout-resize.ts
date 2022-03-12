import { computed } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { DeviceType } from '@/store/modules/app'
import { throttle } from 'lodash-es'

export const resizeConst = {
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1920,
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

  const resizeLayout = throttle(
    async () => {
      if (!document.hidden) {
        bodyRect = document.body.getBoundingClientRect()
        await store.dispatch('app/setBodyHeight', bodyRect.height)
        await store.dispatch('app/setBodyWidth', bodyRect.width)
        await store.dispatch('app/setDocHeight', getDocHeight())
        await store.dispatch('app/setDocWidth', getDocWidth())
        await store.dispatch('app/setBodyWidthRange', getWidthRange(bodyRect.width))
        if (isMobile()) {
          await store.dispatch('app/toggleDevice', DeviceType.Mobile)
          await store.dispatch('app/setSidebarMode', { offScreen: true, opened: false })
        } else {
          await store.dispatch('app/toggleDevice', DeviceType.Desktop)
          await store.dispatch('app/setSidebarMode', { offScreen: false, opened: false })
        }
      }
    },
    300,
    { leading: true, trailing: false }
  )

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
    return bodyRect.width - resizeConst.ratio < resizeConst.md
  }

  const getWidthRange = (w: number) => {
    return (
      (w >= resizeConst.xl && 'xl') ||
      (w >= resizeConst.lg && 'lg') ||
      (w >= resizeConst.md && 'md') ||
      (w >= resizeConst.sm && 'sm') ||
      'xs'
    )
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
