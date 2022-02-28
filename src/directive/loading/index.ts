import type { Directive, DirectiveBinding } from 'vue'
import { ElLoadingService as Loading } from 'element-plus/es/components/loading/index'
import { DEFAULT_LOADING_OPT, ElementLoading, INSTANCE_KEY } from '@/directive/loading/types'

const createInstance = (el: ElementLoading, binding: DirectiveBinding<boolean>) => {
  const options = {
    fullscreen: binding.modifiers.fullscreen,
    target: binding.modifiers.fullscreen ? undefined : el,
    body: binding.modifiers.body,
    lock: binding.modifiers.lock,
    ...DEFAULT_LOADING_OPT
  }
  el[INSTANCE_KEY] = {
    options,
    instance: Loading(options)
  }
}

export const vLoading: Directive<ElementLoading, boolean> = {
  mounted(el, binding) {
    if (binding.value) {
      createInstance(el, binding)
    }
  },
  updated(el, binding) {
    const instance = el[INSTANCE_KEY]
    if (binding.oldValue !== binding.value) {
      if (binding.value && !binding.oldValue) {
        createInstance(el, binding)
      } else {
        instance?.instance.close()
      }
    }
  },
  unmounted(el) {
    el[INSTANCE_KEY]?.instance.close()
  }
}
