<template>
  <teleport to="body">
    <div v-show="visible" :id="elId" ref="wrapperRef" class="fd-popper" :style="style">
      <slot />
    </div>
  </teleport>
</template>

<script lang="ts">
export default {
  name: 'FdPopper'
}
</script>

<script setup lang="ts">
import { POPPER_HIDE_EVENT, POPPER_PROPS_DEFAULT, POPPER_SHOW_EVENT, POPPER_SHOWED_EVENT } from './types'
import { ref } from 'vue'
import usePopper from './usePopper'

const props = defineProps({
  ...POPPER_PROPS_DEFAULT
})

const wrapperRef = ref<HTMLElement>()

const emit = defineEmits([POPPER_SHOW_EVENT, POPPER_SHOWED_EVENT, POPPER_HIDE_EVENT])

const { visible, elId, style, show, hide } = usePopper(props, wrapperRef, emit)

defineExpose({
  show,
  hide
})
</script>
