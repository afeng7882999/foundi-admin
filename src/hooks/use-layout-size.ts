import { useStore } from 'vuex'
import { AllState } from '@/store'
import { DeviceType } from '@/store/modules/app'
import { computed } from 'vue'

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
  let bodyRect = {
    height: 0,
    width: 0,
    x: 0,
    y: 0
  } as DOMRect

  const store = useStore<AllState>()
  const storeState = store.state as AllState

  const getDocH = () => {
    const height = storeState.app.enableTags
      ? sizeConst.tabHeight + sizeConst.titleHeight + sizeConst.titlePadding
      : sizeConst.titleHeight + sizeConst.titlePadding
    return bodyRect.height - height
  }

  const getDocW = () => {
    if (storeState.app.sidebarMode?.offScreen) {
      return bodyRect.width
    }
    if (storeState.app.sidebarMode?.minimized) {
      return bodyRect.width - sizeConst.sidebarMiniWidth
    }
    return bodyRect.width - sizeConst.sidebarNormalWidth
  }

  const resizeLayout = async () => {
    if (!document.hidden) {
      bodyRect = document.body.getBoundingClientRect()
      await store.dispatch('app/setBodyHeight', bodyRect.height)
      await store.dispatch('app/setBodyWidth', bodyRect.width)
      await store.dispatch('app/setDocHeight', getDocH())
      await store.dispatch('app/setDocWidth', getDocW())
      if (bodyRect.width - sizeConst.ratio < breakpoints.sm) {
        await store.dispatch('app/toggleDevice', DeviceType.Mobile)
        return
      }
      if (bodyRect.width - sizeConst.ratio > breakpoints.md) {
        await store.dispatch('app/toggleDevice', DeviceType.Desktop)
        return
      }
      await store.dispatch('app/toggleDevice', DeviceType.Pad)
    }
  }

  const addResizeListener = () => {
    window.addEventListener('resize', resizeLayout)
  }

  const removeResizeListener = () => {
    window.removeEventListener('resize', resizeLayout)
  }

  const doLayout = async () => {
    await resizeLayout()
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
    removeResizeListener,
    device,
    isMobile,
    isMobileOrPad,
    doLayout
  }
}
