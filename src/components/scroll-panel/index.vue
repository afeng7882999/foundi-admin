<template>
  <div ref="scrollPanel" class="fd-scroll-panel">
    <el-scrollbar ref="scrollContainer" :vertical="false" @wheel.prevent="onScrollbarScroll">
      <slot />
    </el-scrollbar>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdScrollPanel'
}
</script>

<script setup lang="ts">
import { scrollElementH } from '@/utils/smooth-scroll'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  horizontal: {
    type: Boolean,
    default: false
  },
  scrollItemClassName: {
    type: String,
    default: 'tags-view-item'
  }
})

const scrollPanel = ref<HTMLElement | null>(null)

const scrollContainer = computed(() => {
  return (scrollPanel.value as HTMLElement).firstElementChild as HTMLElement
})

const scrollWrapper = computed(() => {
  return scrollContainer.value.firstElementChild as HTMLElement
})

onMounted(() => {
  scrollWrapper.value.addEventListener('scroll', emitScroll, true)
})

onBeforeUnmount(() => {
  scrollWrapper.value.removeEventListener('scroll', emitScroll)
})

const getScrollItems = () => {
  const $wrapper = scrollWrapper.value
  const result = [] as HTMLElement[]
  $wrapper.querySelectorAll(`.${props.scrollItemClassName}`).forEach((e) => result.push(e as HTMLElement))
  return result
}

const onScrollbarScroll = (e: WheelEvent) => {
  const eventDelta = -e.deltaY * 40
  scrollWrapper.value.scrollLeft = scrollWrapper.value.scrollLeft + eventDelta / 4
}

const emit = defineEmits(['scroll'])

const emitScroll = () => {
  emit('scroll')
}

const pageRight = () => {
  const $container = scrollContainer.value
  const $items = getScrollItems()
  const containerWidth = $container.offsetWidth
  const scrollWidth = scrollWrapper.value.scrollLeft + containerWidth
  const len = $items.length
  let idx = 0
  for (; idx < len; idx++) {
    if ($items[idx].offsetLeft > scrollWidth) {
      scrollElementH(scrollWrapper.value, $items[idx - 1].offsetLeft)
      break
    }
  }
  if (idx === len) {
    scrollElementH(scrollWrapper.value, scrollWidth)
  }
}

const pageLeft = () => {
  const $container = scrollContainer.value
  const $items = getScrollItems()
  const containerWidth = $container.offsetWidth
  const scrollWidth = scrollWrapper.value.scrollLeft - containerWidth
  if (scrollWidth <= 0) {
    scrollElementH(scrollWrapper.value, 0)
    return
  }
  const len = $items.length
  for (let idx = 0; idx < len; idx++) {
    if ($items[idx].offsetLeft > scrollWidth) {
      scrollElementH(scrollWrapper.value, $items[idx].offsetLeft)
      break
    }
  }
}

const moveToTarget = (target: HTMLElement) => {
  const $container = scrollContainer.value
  const $wrapper = scrollWrapper.value
  const $items = getScrollItems()
  const containerWidth = $container.offsetWidth

  let first = null
  let last = null

  // find first item and last item
  if ($items.length > 0) {
    first = $items[0]
    last = $items[$items.length - 1]
  }

  if (first === target) {
    scrollElementH(scrollWrapper.value, 0)
  } else if (last === target) {
    scrollElementH(scrollWrapper.value, $wrapper.scrollWidth - containerWidth)
  } else {
    // find previous and next one
    const currentIdx = $items.findIndex((item) => item === target)
    const prev = $items[currentIdx - 1]
    const next = $items[currentIdx + 1]

    // the item's offsetLeft after next one
    const afterNextOffsetLeft = next.offsetLeft + next.offsetWidth

    // the item's offsetLeft before previous one
    const beforePrevOffsetLeft = prev.offsetLeft

    if (afterNextOffsetLeft > $wrapper.scrollLeft + containerWidth) {
      scrollElementH(scrollWrapper.value, afterNextOffsetLeft - containerWidth)
    } else if (beforePrevOffsetLeft < $wrapper.scrollLeft) {
      scrollElementH(scrollWrapper.value, beforePrevOffsetLeft)
    }
  }
}

const moveToIdx = (idx: number) => {
  console.log(idx)
  const $container = scrollContainer.value
  const $wrapper = scrollWrapper.value
  const $items = getScrollItems()
  const containerWidth = $container.offsetWidth

  if (idx === 0) {
    scrollElementH(scrollWrapper.value, 0)
  } else if (idx === $items.length - 1) {
    scrollElementH(scrollWrapper.value, $wrapper.scrollWidth - containerWidth)
  } else {
    const prev = $items[idx - 1]
    const next = $items[idx + 1]

    // the item's offsetLeft after next one
    const afterNextOffsetLeft = next.offsetLeft + next.offsetWidth

    // the item's offsetLeft before previous one
    const beforePrevOffsetLeft = prev.offsetLeft

    if (afterNextOffsetLeft > $wrapper.scrollLeft + containerWidth) {
      scrollElementH(scrollWrapper.value, afterNextOffsetLeft - containerWidth)
    } else if (beforePrevOffsetLeft < $wrapper.scrollLeft) {
      scrollElementH(scrollWrapper.value, beforePrevOffsetLeft)
    }
  }
}

defineExpose({
  pageRight,
  pageLeft,
  moveToTarget,
  moveToIdx
})
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.fd-scroll-panel {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
}
</style>
