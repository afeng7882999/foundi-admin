import { useStore } from 'vuex'
import { BaseState, storeKey } from '@b/store'
import { DeviceType } from '@b/store/modules/app'
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

export const getDeviceSize = (w?: number) => {
  w = w ?? document.body.getBoundingClientRect().width
  if (w - sizeConst.ratio < breakpoints.sm) {
    return DeviceType.Mobile
  }
  if (w - sizeConst.ratio > breakpoints.md) {
    return DeviceType.Desktop
  }
  return DeviceType.Pad
}

export default function useLayoutSize(react: boolean | undefined = true) {
  const store = useStore(storeKey)
  const storeState = store.state

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
    await store.dispatch('app/toggleDeviceSize', getDeviceSize())
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

  const deviceSize = computed(() => {
    return storeState?.app ? storeState.app.deviceSize : getDeviceSize()
  })

  const isMobileSize = computed(() => {
    if (!react) {
      return false
    }
    const deviceSize = storeState?.app ? storeState.app.deviceSize : getDeviceSize()
    return deviceSize === DeviceType.Mobile
  })

  const isPadSize = computed(() => {
    if (!react) {
      return false
    }
    const deviceSize = storeState?.app ? storeState.app.deviceSize : getDeviceSize()
    return deviceSize === DeviceType.Pad
  })

  const isMobileOrPadSize = computed(() => {
    if (!react) {
      return false
    }
    const deviceSize = storeState?.app ? storeState.app.deviceSize : getDeviceSize()
    return deviceSize === DeviceType.Mobile || deviceSize === DeviceType.Pad
  })

  return {
    addResizeObserver,
    deviceSize,
    isPadSize,
    isMobileSize,
    isMobileOrPadSize,
    doLayoutResize
  }
}
