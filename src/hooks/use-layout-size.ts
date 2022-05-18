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

  const getDocH = (h: number) => {
    const height = storeState.app.enableTags
      ? sizeConst.tabHeight + sizeConst.titleHeight + sizeConst.titlePadding
      : sizeConst.titleHeight + sizeConst.titlePadding
    return h - height
  }

  const getDocW = (w: number) => {
    if (storeState.app.sidebarMode?.offScreen) {
      return w
    }
    if (storeState.app.sidebarMode?.minimized) {
      return w - sizeConst.sidebarMiniWidth
    }
    return w - sizeConst.sidebarNormalWidth
  }

  const resizeLayout = async (w: number, h: number) => {
    await store.dispatch('app/setBodyHeight', h)
    await store.dispatch('app/setBodyWidth', w)
    await store.dispatch('app/setDocHeight', getDocH(h))
    await store.dispatch('app/setDocWidth', getDocW(w))
    if (w - sizeConst.ratio < breakpoints.sm) {
      await store.dispatch('app/toggleDevice', DeviceType.Mobile)
      return
    }
    if (w - sizeConst.ratio > breakpoints.md) {
      await store.dispatch('app/toggleDevice', DeviceType.Desktop)
      return
    }
    await store.dispatch('app/toggleDevice', DeviceType.Pad)
  }

  const addResizeObserver = () => {
    useResizeObserver(document.body, async (entries) => {
      if (document.hidden) {
        return
      }
      const rect = entries[0].contentRect
      await resizeLayout(Math.floor(rect.width), Math.floor(rect.height))
    })
  }

  const doLayoutResize = async () => {
    if (document.hidden) {
      return
    }
    const rect = document.body.getBoundingClientRect()
    await resizeLayout(Math.floor(rect.width), Math.floor(rect.height))
  }

  const device = computed(() => {
    return storeState.app.device
  })

  const isMobile = computed(() => {
    return react ? storeState.app.device === DeviceType.Mobile : false
  })

  const isPad = computed(() => {
    return react ? storeState.app.device === DeviceType.Pad : false
  })

  const isMobileOrPad = computed(() => {
    return react ? storeState.app.device === DeviceType.Mobile || storeState.app.device === DeviceType.Pad : false
  })

  return {
    addResizeObserver,
    device,
    isPad,
    isMobile,
    isMobileOrPad,
    doLayoutResize
  }
}
