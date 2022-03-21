import { computed, ExtractPropTypes, getCurrentInstance, inject } from 'vue'
import { FORM_ITEM_DEFAULT_PROPS } from '@/extend/form/type'
import { Indexable } from '@/common/types'
import { ElFormContext, elFormKey } from 'element-plus'
import { isString, upperFirst } from 'lodash-es'

export interface UseQueryItemDefaultOpt {
  width: string
  placeholder: string
}

const useFormItem = (props: Readonly<ExtractPropTypes<typeof FORM_ITEM_DEFAULT_PROPS>>, option?: Partial<UseQueryItemDefaultOpt>) => {
  const formCtx = inject(elFormKey, {} as ElFormContext)

  const vm = getCurrentInstance()
  const formInstCo = computed(() => {
    let parent = vm?.parent
    while (parent && parent.type.name !== 'ElForm') {
      parent = parent.parent
    }
    return parent
  })

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
    // 如果不是 inline form， 宽度设置为100%
    const w = props.width ?? !formCtx.inline ? '100%' : option?.width
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

  const formSubmit = () => {
    // 仅在 inline form 起作用
    if (!formCtx.inline) {
      return
    }
    if (props.trigger && isString(props.trigger)) {
      const fun = 'on' + upperFirst(props.trigger)
      const attrs = formInstCo.value?.attrs as Indexable
      if (attrs && attrs[fun]) {
        attrs[fun]()
      }
    }
  }

  return {
    model: () => formCtx.model,
    formInstCo,
    placeholderCo,
    visibleCo,
    disabledCo,
    styleCo,
    formSubmit
  }
}

export default useFormItem
