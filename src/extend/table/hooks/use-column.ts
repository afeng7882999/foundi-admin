import { COL_DEFAULT_PROPS } from '@/extend/table/types'
import { computed, ExtractPropTypes } from 'vue'
import usePage from '@/extend/page/use-page'
import { isBoolean } from 'lodash-es'

const useColumn = (props: Readonly<ExtractPropTypes<typeof COL_DEFAULT_PROPS>>) => {
  const { auth } = usePage()

  const visible = computed(() => {
    if (props.auth) {
      return auth(props.auth)
    }
    return true
  })

  const booleanOrAuth = (val: boolean | string) => {
    if (isBoolean(val)) {
      return val
    }
    if (val) {
      return auth(val)
    }
    return true
  }

  const sortable = computed(() => {
    return !!props.onSortChanged
  })

  return {
    visible,
    sortable,
    auth,
    booleanOrAuth
  }
}

export default useColumn
