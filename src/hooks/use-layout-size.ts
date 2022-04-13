import { useStore } from 'vuex'
import { AllState } from '@/store'
import { DeviceType } from '@/store/modules/app'
import { computed } from 'vue'
import { useResizeObserver } from '@vueuse/core'

export const sizeConst = {
  ratio: 3,
  titleHeight: 48,
  tabHeight: 48,
  titlePadding: 8,
  sidebarMiniWidth: 56,
  sidebarNormalWidth: 240,
  footerHeight: 48,
  pageHeaderHeight: 48
}

export const breakpoints = {
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1920
}

export default function useLayoutSize(react: boolean | undefined = true) {
  const store = useStore<AllState>()
  const storeState = store.state as AllState

  const getDocH = (rect: DOMRectReadOnly) => {
    const height = storeState.app.enableTags
      ? sizeConst.tabHeight + sizeConst.titleHeight + sizeConst.titlePadding
      : sizeConst.titleHeight + sizeConst.titlePadding
    return rect.height - height
  }

  const getDocW = (rect: DOMRectReadOnly) => {
    if (storeState.app.sidebarMode?.offScreen) {
      return rect.width
    }
    if (storeState.app.sidebarMode?.minimized) {
      return rect.width - sizeConst.sidebarMiniWidth
    }
    return rect.width - sizeConst.sidebarNormalWidth
  }

  const resizeLayout = async (rect: DOMRectReadOnly) => {
    await store.dispatch('app/setBodyHeight', rect.height)
    await store.dispatch('app/setBodyWidth', rect.width)
    await store.dispatch('app/setDocHeight', getDocH(rect))
    await store.dispatch('app/setDocWidth', getDocW(rect))
    if (rect.width - sizeConst.ratio < breakpoints.sm) {
      await store.dispatch('app/toggleDevice', DeviceType.Mobile)
      return
    }
    if (rect.width - sizeConst.ratio > breakpoints.md) {
      await store.dispatch('app/toggleDevice', DeviceType.Desktop)
      return
    }
    await store.dispatch('app/toggleDevice', DeviceType.Pad)
  }

  const addResizeListener = () => {
    useResizeObserver(document.body, async (entries) => {
      if (document.hidden) {
        return
      }
      await resizeLayout(entries[0].contentRect)
    })
  }

  const doLayout = async () => {
    if (document.hidden) {
      return
    }
    await resizeLayout(document.body.getBoundingClientRect())
  }

  const device = computed(() => {
    return storeState.app.device
  })

  const isMobile = computed(() => {
    return react ? storeState.app.device === DeviceType.Mobile : false
  })

  const isMobileOrPad = computed(() => {
    return react ? storeState.app.device === DeviceType.Mobile || storeState.app.device === DeviceType.Pad : false
  })

  return {
    addResizeListener,
    device,
    isMobile,
    isMobileOrPad,
    doLayout
  }
}
