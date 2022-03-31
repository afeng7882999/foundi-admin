import {computed, ExtractPropTypes, getCurrentInstance, inject, ref} from 'vue'
import { FORM_ITEM_DEFAULT_PROPS } from '@/extend/form/type'
import { Indexable } from '@/common/types'
import { ElFormContext, elFormKey } from 'element-plus'
import { isString } from 'lodash-es'
import { editContextKey, EditContext } from '@/extend/crud/use-edit'
import {useTimeoutFn} from "@vueuse/core";
import {hasClass} from "@/utils/dom";

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

  const formSubmitFn = computed(() => {
    const attrs = formInstance.value?.attrs as Indexable
    if (attrs && props.trigger && isString(props.trigger)) {
      return attrs[props.trigger]
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
    if (formSubmitFn.value) {
      formSubmitFn.value()
    }
  }

  const tipTriggerRef = ref()
  const tipVisible = ref(false)

  const { start: delayShow, stop: cancelShow } = useTimeoutFn(() => (tipVisible.value = true), props.tipDelay, { immediate: false })

  const tipShow = (e: Event) => {
    const target = e.currentTarget as HTMLElement
    if (props.tipIcon && !hasClass(target, 'tip-icon')) {
      return
    }
    if (props.tip) {
      cancelShow()
      tipTriggerRef.value = e.currentTarget
      delayShow()
    }
  }

  const tipHide = () => {
    if (props.tip) {
      cancelShow()
      tipVisible.value = false
    }
  }

  const editContext = inject(editContextKey, {} as Partial<EditContext>)
  const { onAfterGetData, onBeforeOpen, onBeforeSubmitData, onBeforeSubmit, onAfterClose } = editContext

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
    tipTriggerRef,
    tipVisible,
    tipShow,
    tipHide,
    onAfterGetData,
    onBeforeOpen,
    onBeforeSubmitData,
    onBeforeSubmit,
    onAfterClose
  }
}

export default useFormItem
