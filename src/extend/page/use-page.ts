import { isAuth } from '@/app/account'
import { computed, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { getTreeNode } from '@/utils/data-tree'
import { resizeConst } from '@/hooks/use-layout-resize'
import { merge } from 'lodash-es'

export type PageStateOption = Partial<{
  // 页面标题
  title: string
  // 页面图标
  icon: string
  // 页面描述
  desc: string
  // 是否显示页脚
  footerVisible: boolean
}>

export default function (stateOption?: PageStateOption) {
  const defaultState = reactive({
    // 页面标题
    title: '',
    // 页面图标
    icon: '',
    // 页面描述
    desc: '',
    // 是否显示页脚
    footerVisible: true
  })

  const pageState = reactive(merge({}, defaultState, stateOption) as typeof defaultState & PageStateOption)

  const store = useStore<AllState>()
  const storeState = store.state as AllState
  const route = useRoute()
  const router = useRouter()

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

  // 获取页面信息
  const getPageMeta = () => {
    const current = storeState.view.visitedViews.find((v) => v.path === route.path)

    if (current) {
      pageState.icon = current?.meta.icon as string
      pageState.desc = current?.meta.remark as string
      pageState.title = (current as any).title
    } else if (storeState.user.menu) {
      const menu = getTreeNode(storeState.user.menu, (m) => m.url === route.path)
      if (menu) {
        pageState.icon = menu.icon
        pageState.title = menu.name
        pageState.desc = menu.remark
      }
    }
  }

  onBeforeRouteUpdate(() => {
    getPageMeta()
  })

  onMounted(() => {
    getPageMeta()
  })

  // 设置页面标题
  const setViewTitle = async (path: string, title: string) => {
    await store.dispatch('view/addViewTitle', { path, title })
  }

  // 获取页面标题
  const getViewTitle = (title = '页面') => {
    const t = storeState.view.viewTitles.filter((t) => t.path === route.path)[0]
    return t ? t.title : title
  }

  // 返回上一页
  const goBack = () => {
    router.back()
  }

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
    getPageMeta,
    setViewTitle,
    getViewTitle,
    goBack
  }
}