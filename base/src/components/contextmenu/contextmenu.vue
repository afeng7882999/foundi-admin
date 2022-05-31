<template>
  <fd-popper
    ref="popper"
    :target="target"
    :target-offset="targetOffset"
    :trigger="trigger"
    :show-delay="showDelay"
    :hide-delay="hideDelay"
    :disabled="disabled"
  >
    <ul class="fd-contextmenu">
      <slot />
    </ul>
  </fd-popper>
</template>

<script lang="ts">
export default {
  name: 'FdContextmenu'
}
</script>

<script setup lang="ts">
import FdPopper from '@b/components/popper/index.vue'
import { PropType, provide, ref } from 'vue'
import { FdPopperType } from '@b/components/popper/types'

const props = defineProps({
  target: {
    type: Boolean,
    default: false
  },
  targetOffset: {
    type: Number,
    default: 8
  },
  trigger: {
    type: String as PropType<'click' | 'enter'>,
    default: 'click',
    validator: (val: string) => ['click', 'enter'].includes(val)
  },
  showDelay: {
    type: Number,
    default: 0
  },
  hideDelay: {
    type: Number,
    default: 300
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const popper = ref<FdPopperType>()

provide('contextmenuHide', () => popper.value?.hide())

defineExpose({
  show: (e: PointerEvent) => popper.value?.show(e),
  hide: () => popper.value?.hide()
})
</script>
