import { isAuth } from '@/app/account'
import { computed, reactive } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { resizeConst } from '@/hooks/use-layout-resize'
import { merge } from 'lodash-es'

export type PageStateOption = Partial<{
  // 是否显示页脚
  footerVisible: boolean
}>

export default function (stateOption?: PageStateOption) {
  const defaultState = reactive({
    // 是否显示页脚
    footerVisible: true
  })

  const pageState = reactive(merge({}, defaultState, stateOption) as typeof defaultState & PageStateOption)

  const store = useStore<AllState>()
  const storeState = store.state as AllState

  // 判断权限
  const hasAuth = (key: string) => {
    return isAuth(key)
  }

  // Doc最小高度
  const docMinHeight = computed(() => {
    const footer = pageState.footerVisible ? resizeConst.footerHeight : 0
    const height = storeState.app.docHeight - footer
    return { minHeight: height + 'px' }
  })

  // Doc高度
  const docHeight = computed(() => {
    const footer = pageState.footerVisible ? resizeConst.footerHeight : 0
    const height = storeState.app.docHeight - footer
    return { height: height + 'px' }
  })

  // 获取窗口宽度
  const getBodyWidth = (remove: number, unit?: string): number | string => {
    if (unit) {
      return (storeState.app.bodyWidth - remove + unit) as string
    } else {
      return (storeState.app.bodyWidth - remove) as number
    }
  }

  // 获取窗口高度
  const getBodyHeight = (remove: number, unit?: string): number | string => {
    if (unit) {
      return (storeState.app.bodyHeight - remove + unit) as string
    } else {
      return (storeState.app.bodyHeight - remove) as number
    }
  }

  // 获取Doc宽度
  const getDocWidth = (remove: number, unit?: string): number | string => {
    if (unit) {
      return (storeState.app.docWidth - remove + unit) as string
    } else {
      return (storeState.app.docWidth - remove) as number
    }
  }

  // 获取Doc高度
  const getDocHeight = (remove: number, unit?: string): number | string => {
    const footer = pageState.footerVisible ? resizeConst.footerHeight : 0
    if (unit) {
      return (storeState.app.docHeight - remove - footer + unit) as string
    } else {
      return (storeState.app.docHeight - remove - footer) as number
    }
  }

  // 获取Doc高度，去除 PageHeader, PageFooter 高度
  const getDocHeightNoHeaderFooter = (remove: number, unit?: string): number | string => {
    const header = storeState.app.enableTags ? 0 : resizeConst.pageHeaderHeight
    const footer = pageState.footerVisible ? resizeConst.footerHeight : 0
    if (unit) {
      return (storeState.app.docHeight - remove - header - footer + unit) as string
    } else {
      return (storeState.app.docHeight - remove - header - footer) as number
    }
  }

  // 是否显示页面标题
  const showPageHeader = computed(() => {
    return !storeState.app.enableTags
  })

  // 2列响应式布局
  const col2 = computed(() => {
    return {
      xs: 24,
      span: 12,
      lg: 8,
      xl: 6
    }
  })

  // 3列响应式布局
  const col3 = computed(() => {
    return {
      xs: 24,
      span: 8,
      lg: 6,
      xl: 6
    }
  })

  return {
    pageState,
    showPageHeader,
    docMinHeight,
    docHeight,
    getBodyWidth,
    getBodyHeight,
    getDocWidth,
    getDocHeightNoHeaderFooter,
    getDocHeight,
    hasAuth,
    col2,
    col3
  }
}
