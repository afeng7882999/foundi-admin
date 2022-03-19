import { COL_DEFAULT_PROPS } from '@/extend/table/types'
import { computed, ExtractPropTypes } from 'vue'
import usePage from '@/extend/page/use-page'
import { isBoolean } from 'lodash-es'

const useColumn = (props: Readonly<ExtractPropTypes<typeof COL_DEFAULT_PROPS>>) => {
  const { hasAuth } = usePage()

  const visible = computed(() => {
    if (props.auth) {
      return hasAuth(props.auth)
    }
    return true
  })

  const booleanOrAuth = (val: boolean | string) => {
    if (isBoolean(val)) {
      return val
    }
    if (val) {
      return hasAuth(val)
    }
    return true
  }

  const sortable = computed(() => {
    return !!props.onSortChanged
  })

  return {
    visible,
    sortable,
    hasAuth,
    booleanOrAuth
  }
}

export default useColumn
