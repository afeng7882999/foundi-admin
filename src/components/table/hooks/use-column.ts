import { COL_DEFAULT_PROPS } from '@/components/table/types'
import { computed, ExtractPropTypes } from 'vue'
import usePage from '@/components/crud/use-page'

const useColumn = (props: Readonly<ExtractPropTypes<typeof COL_DEFAULT_PROPS>>) => {
  const { hasAuth } = usePage()

  const visible = computed(() => {
    if (props.auth) {
      return hasAuth(props.auth)
    }
    return true
  })

  return {
    visible,
    hasAuth
  }
}

export default useColumn
