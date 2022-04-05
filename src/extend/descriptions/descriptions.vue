<template>
  <el-descriptions v-bind="$attrs" :column="columnCo" :direction="directionCo" :class="objClass">
    <slot />
    <template #title>
      <slot name="title" />
    </template>
    <template #extra>
      <slot name="extra" />
    </template>
  </el-descriptions>
</template>

<script lang="ts">
export default {
  name: 'FdDescriptions',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import useLayoutSize from '@/hooks/use-layout-size'
import { computed, PropType } from 'vue'

const props = defineProps({
  column: {
    type: Number,
    default: 2
  },
  direction: {
    type: String as PropType<'vertical' | 'horizontal'>,
    default: 'vertical',
    validator: (val: string) => ['vertical', 'horizontal'].includes(val)
  },
  mobileCompact: {
    type: Boolean,
    default: true
  }
})

const { isMobile } = useLayoutSize(props.mobileCompact)

const objClass = computed(() => {
  const clazz = ['fd-descriptions']
  if (isMobile.value) {
    clazz.push('is-mobile')
  }
  return clazz.join(' ')
})

const columnCo = computed(() => {
  if (props.mobileCompact && isMobile.value) {
    return 1
  }
  return props.column
})

const directionCo = computed(() => {
  if (props.mobileCompact && isMobile.value) {
    return 'vertical'
  }
  return props.direction
})
</script>
