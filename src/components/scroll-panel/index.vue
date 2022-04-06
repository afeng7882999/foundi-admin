<template>
  <div ref="scrollPanel" class="fd-scroll-panel">
    <el-scrollbar ref="scrollContainer" :vertical="false" @wheel.prevent="onScrollbarScroll">
      <slot />
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { scrollElementH } from '@/utils/smooth-scroll'
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineOptions({
  name: 'FdScrollPanel'
})

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

const getScrollContainer = () => {
  return (scrollPanel.value as HTMLElement).firstElementChild as HTMLElement
}

const getScrollWrapper = () => {
  return getScrollContainer().firstElementChild as HTMLElement
}

onMounted(() => {
  getScrollWrapper().addEventListener('scroll', emitScroll, true)
})

onBeforeUnmount(() => {
  getScrollWrapper().removeEventListener('scroll', emitScroll)
})

const getScrollItems = () => {
  const $wrapper = getScrollWrapper()
  const result = [] as HTMLElement[]
  $wrapper.querySelectorAll(`.${props.scrollItemClassName}`).forEach((e) => result.push(e as HTMLElement))
  return result
}

const onScrollbarScroll = (e: WheelEvent) => {
  const $wrapper = getScrollWrapper()
  const eventDelta = -e.deltaY * 40
  $wrapper.scrollLeft = $wrapper.scrollLeft + eventDelta / 4
}

const emit = defineEmits(['scroll'])

const emitScroll = () => {
  emit('scroll')
}

const pageRight = () => {
  const $container = getScrollContainer()
  const $wrapper = getScrollWrapper()
  const $items = getScrollItems()
  const containerWidth = $container.offsetWidth
  const scrollWidth = $wrapper.scrollLeft + containerWidth
  const len = $items.length
  let idx = 0
  for (; idx < len; idx++) {
    if ($items[idx].offsetLeft > scrollWidth) {
      scrollElementH($wrapper, $items[idx - 1].offsetLeft)
      break
    }
  }
  if (idx === len) {
    scrollElementH($wrapper, scrollWidth)
  }
}

const pageLeft = () => {
  const $container = getScrollContainer()
  const $wrapper = getScrollWrapper()
  const $items = getScrollItems()
  const containerWidth = $container.offsetWidth
  const scrollWidth = $wrapper.scrollLeft - containerWidth
  if (scrollWidth <= 0) {
    scrollElementH($wrapper, 0)
    return
  }
  const len = $items.length
  for (let idx = 0; idx < len; idx++) {
    if ($items[idx].offsetLeft > scrollWidth) {
      scrollElementH($wrapper, $items[idx].offsetLeft)
      break
    }
  }
}

const moveToTarget = (target: HTMLElement) => {
  const $container = getScrollContainer()
  const $wrapper = getScrollWrapper()
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
    scrollElementH($wrapper, 0)
  } else if (last === target) {
    scrollElementH($wrapper, $wrapper.scrollWidth - containerWidth)
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
      scrollElementH($wrapper, afterNextOffsetLeft - containerWidth)
    } else if (beforePrevOffsetLeft < $wrapper.scrollLeft) {
      scrollElementH($wrapper, beforePrevOffsetLeft)
    }
  }
}

const moveToIdx = (idx: number) => {
  const $container = getScrollContainer()
  const $wrapper = getScrollWrapper()
  const $items = getScrollItems()
  const containerWidth = $container.offsetWidth

  if (idx === 0) {
    scrollElementH($wrapper, 0)
  } else if (idx === $items.length - 1) {
    scrollElementH($wrapper, $wrapper.scrollWidth - containerWidth)
  } else {
    const prev = $items[idx - 1]
    const next = $items[idx + 1]

    // the item's offsetLeft after next one
    const afterNextOffsetLeft = next.offsetLeft + next.offsetWidth

    // the item's offsetLeft before previous one
    const beforePrevOffsetLeft = prev.offsetLeft

    if (afterNextOffsetLeft > $wrapper.scrollLeft + containerWidth) {
      scrollElementH($wrapper, afterNextOffsetLeft - containerWidth)
    } else if (beforePrevOffsetLeft < $wrapper.scrollLeft) {
      scrollElementH($wrapper, beforePrevOffsetLeft)
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
