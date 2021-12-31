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

  // 窗口最小高度
  const pageMinHeight = computed(() => {
    const height = storeState.app.docHeight - 40
    return { minHeight: height + 'px' }
  })

  // 窗口高度
  const pageHeight = computed(() => {
    const height = storeState.app.docHeight - 40
    return { height: height + 'px' }
  })

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
    pageMinHeight,
    pageHeight,
    showPageHeader,
    hasAuth,
    setViewTitle,
    currentViewTitle
  }
}
