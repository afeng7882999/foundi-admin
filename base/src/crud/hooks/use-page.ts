import { isAuth } from '@b/app/account'
import { computed, reactive } from 'vue'
import { merge } from 'lodash-es'
import { LAYOUT_SIZES } from '@b/common/global'
import store from '@b/store'

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

  const storeState = store.state

  // 判断权限
  const auth = (key: string) => {
    return isAuth(key)
  }

  // Doc最小高度
  const docMinHeight = computed(() => {
    const height = storeState.app.docHeight
    return { minHeight: height + 'px' }
  })

  // Doc高度
  const docHeight = computed(() => {
    const height = storeState.app.docHeight
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
    const footer = pageState.footerVisible ? LAYOUT_SIZES.footerHeight : 0
    if (unit) {
      return (storeState.app.docHeight - remove - footer + unit) as string
    } else {
      return (storeState.app.docHeight - remove - footer) as number
    }
  }

  // 获取Doc高度，去除 PageHeader, PageFooter 高度
  const getDocHeightNoHeaderFooter = (remove: number, unit?: string): number | string => {
    const header = storeState.app.enableTags ? 0 : LAYOUT_SIZES.pageHeaderHeight
    const footer = pageState.footerVisible ? LAYOUT_SIZES.footerHeight : 0
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
    auth
  }
}
