import { computed } from 'vue'
import useBasePage, { PageStateOption } from '@b/crud/hooks/use-page'

export default function (stateOption?: PageStateOption) {
  const {
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
  } = useBasePage(stateOption)

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
    auth,
    col2,
    col3
  }
}
