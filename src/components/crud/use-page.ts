import { isAuth } from '@/app/account'
import { computed } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { useRoute } from 'vue-router'

export default function () {
  const store = useStore<AllState>()
  const storeState = store.state as AllState
  const route = useRoute()

  // 判断权限
  const hasAuth = (key: string) => {
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
    if (unit) {
      return (storeState.app.docHeight - remove + unit) as string
    } else {
      return (storeState.app.docHeight - remove) as number
    }
  }

  // 是否显示页面标题
  const showPageHeader = computed(() => {
    return !storeState.app.enableTags
  })

  // 设置页面标题
  const setViewTitle = async (path: string, title: string) => {
    await store.dispatch('view/addViewTitle', { path, title })
  }

  // 获取页面标题
  const currentViewTitle = (title = '页面') => {
    const t = storeState.view.viewTitles.filter((t) => t.path === route.path)[0]
    return t ? t.title : title
  }

  return {
    showPageHeader,
    docMinHeight,
    docHeight,
    getBodyWidth,
    getBodyHeight,
    getDocWidth,
    getDocHeight,
    hasAuth,
    setViewTitle,
    currentViewTitle
  }
}
