import { COL_DEFAULT_PROPS } from '@/components/table/types'
import { computed, ExtractPropTypes } from 'vue'
import usePage from '@/components/page/use-page'
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

  return {
    visible,
    hasAuth,
    booleanOrAuth
  }
}

export default useColumn
