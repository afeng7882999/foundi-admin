import { computed, ExtractPropTypes, inject } from 'vue'
import { FORM_ITEM_DEFAULT_PROPS } from '@/components/form/type'
import { Indexable } from '@/types/global'
import { ElFormContext, elFormKey } from 'element-plus'

export interface UseQueryItemDefaultOpt {
  width: string
  placeholder: string
}

const useFormItem = (props: Readonly<ExtractPropTypes<typeof FORM_ITEM_DEFAULT_PROPS>>, option?: Partial<UseQueryItemDefaultOpt>) => {
  const elForm = inject(elFormKey, {} as ElFormContext)

  const placeholderCo = computed(() => {
    const p = props.placeholder ?? option?.placeholder
    if (p) {
      const pl = p.split(',').map((s) => s.trim())
      return pl.length === 1 ? pl[0] : pl
    }
    return ''
  })

  const styleCo = computed(() => {
    const style = {} as Indexable
    const w = props.width ?? option?.width
    if (w && w !== 'auto') {
      if (w.endsWith('px') || w.endsWith('%')) {
        style.width = w
      } else {
        style.width = w + 'px'
      }
    }
    return style
  })

  const visibleCo = computed(() => {
    return props.visible
  })

  const disabledCo = computed(() => {
    return props.disabled
  })

  return {
    model: elForm.model,
    placeholderCo,
    visibleCo,
    disabledCo,
    styleCo
  }
}

export default useFormItem
