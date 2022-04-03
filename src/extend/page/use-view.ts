import { getTreeNode } from '@/utils/data-tree'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { onActivated, onMounted, reactive } from 'vue'
import { Indexable } from '@/common/types'
import { merge } from 'lodash-es'
import { useStore } from 'vuex'
import { AllState } from '@/store'

export type ViewStateOption = Partial<{
  // 页面标题
  title: string
  // 页面图标
  icon: string
  // 页面描述
  desc: string
}>

const useView = (stateOption?: ViewStateOption) => {
  const defaultState = reactive({
    // 页面标题
    title: '',
    // 页面图标
    icon: '',
    // 页面描述
    desc: '',
    // 页面id
    uniqueId: ''
  })

  const viewState = reactive(merge({}, defaultState, stateOption) as typeof defaultState & ViewStateOption)

  const mixHandlers = {
    // 页面刷新
    refreshFn: [
      async () => {
        return
      }
    ]
  }

  // 页面刷新
  const onRefresh = (fn: () => Promise<void>) => {
    mixHandlers.refreshFn.push(fn)
  }

  const store = useStore<AllState>()
  const storeState = store.state as AllState
  const route = useRoute()
  const router = useRouter()

  // 获取页面信息
  const getViewMeta = () => {
    const current = storeState.view.visitedViews.find((v) => v.path === route.path)

    if (current) {
      viewState.icon = current?.meta.icon as string
      viewState.desc = current?.meta.remark as string
      viewState.title = (current as any).title
    } else if (storeState.user.menu) {
      const menu = getTreeNode(storeState.user.menu, (m) => m.url === route.path)
      if (menu) {
        viewState.icon = menu.icon
        viewState.title = menu.name
        viewState.desc = menu.remark
      }
    }
  }

  onBeforeRouteUpdate(() => {
    getViewMeta()
  })

  onMounted(() => {
    getViewMeta()
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

  // 转到新页面
  const gotoView = async (routeName: string, routeParams: Indexable, path: string, title: string) => {
    await setViewTitle(path, title)
    await router.push({ name: routeName, params: routeParams })
  }

  // 返回列表页
  const goBackToView = async (path: string) => {
    await store.dispatch('view/delView', route)
    await router.push({ path, query: { t: Date.now() } })
  }

  // 返回上一页
  const goBack = () => {
    router.back()
  }

  onActivated(async () => {
    const time = route.query.t as string
    if (time && time !== viewState.uniqueId) {
      viewState.uniqueId = time
      for (const fn of mixHandlers.refreshFn) {
        await fn?.()
      }
    }
  })

  return {
    viewState,
    getViewMeta,
    setViewTitle,
    getViewTitle,
    gotoView,
    goBackToView,
    goBack,
    onRefresh
  }
}

export default useView
