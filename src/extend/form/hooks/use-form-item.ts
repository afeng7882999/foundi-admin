import { computed, ExtractPropTypes, getCurrentInstance, inject } from 'vue'
import { FORM_ITEM_DEFAULT_PROPS } from '@/extend/form/type'
import { Indexable } from '@/common/types'
import { ElFormContext, elFormKey } from 'element-plus'
import { isString, upperFirst } from 'lodash-es'
import { editContextKey, EditContext } from '@/extend/crud/use-edit'

export interface UseQueryItemDefaultOpt {
  width: string
  placeholder: string
}

const useFormItem = (props: Readonly<ExtractPropTypes<typeof FORM_ITEM_DEFAULT_PROPS>>, option?: Partial<UseQueryItemDefaultOpt>) => {
  const formCtx = inject(elFormKey, {} as ElFormContext)

  const vm = getCurrentInstance()
  const formInstance = computed(() => {
    let parent = vm?.parent
    while (parent && parent.type.name !== 'ElForm') {
      parent = parent.parent
    }
    return parent
  })

  const formCompact = computed(() => {
    const attrs = formInstance.value?.attrs as Indexable
    return attrs && (attrs.compact === true || attrs.compact === '')
  })

  const formSubmit = computed(() => {
    const attrs = formInstance.value?.attrs as Indexable
    if (attrs && props.trigger && isString(props.trigger)) {
      const fun = 'on' + upperFirst(props.trigger)
      return attrs[fun]
    }
    return null
  })

  const placeholderCo = computed(() => {
    const p = props.placeholder ?? option?.placeholder
    if (p) {
      const pl = p.split(',').map((s) => s.trim())
      return pl.length === 1 ? pl[0] : pl
    }
    return ''
  })

  const itemClass = computed(() => {
    const clazz = ['fd-item']
    if (props.noLabel) {
      clazz.push('is-no-label')
    }
    return clazz
  })

  const getStyle = () => {
    const style = {} as Indexable
    const w = props.width ?? (formCompact.value ? option?.width : '100%')
    if (w && w !== 'auto') {
      if (w.endsWith('px') || w.endsWith('%')) {
        style.width = w
      } else {
        style.width = w + 'px'
      }
    }
    return style
  }

  const itemStyle = computed(() => {
    return formCompact.value ? {} : { width: '100%' }
  })

  const comStyle = computed(() => {
    return getStyle()
  })

  const visibleCo = computed(() => {
    return props.visible
  })

  const disabledCo = computed(() => {
    return props.disabled
  })

  const submit = () => {
    if (formSubmit.value) {
      formSubmit.value()
    }
  }

  const detailContext = inject(editContextKey, {} as Partial<EditContext>)
  const { onAfterGetData, onBeforeOpen, onBeforeSubmitData, onBeforeSubmit, onAfterClose } = detailContext

  return {
    model: () => formCtx.model,
    formInstance,
    placeholderCo,
    visibleCo,
    disabledCo,
    itemClass,
    itemStyle,
    comStyle,
    submit,
    onAfterGetData,
    onBeforeOpen,
    onBeforeSubmitData,
    onBeforeSubmit,
    onAfterClose
  }
}

export default useFormItem
