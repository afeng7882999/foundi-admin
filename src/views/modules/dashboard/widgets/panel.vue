<template>
  <div class="fd-wg-panel" :class="cardClass" :style="cardStyle">
    <div class="fd-wg-panel__header">
      <div class="fd-wg-panel__icon">
        <fd-icon :icon="props.icon"></fd-icon>
      </div>
      <span class="fd-wg-panel__title">{{ props.title }}</span>
      <div class="fd-wg-panel__action">
        <slot name="action"></slot>
        <div class="fd-wg-panel__minimize">
          <fd-icon-button icon="right" @click="onMinBtnClick"></fd-icon-button>
        </div>
      </div>
    </div>
    <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
      <div v-show="!state.isMinimized" class="fd-wg-panel__main">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdWidgetPanel'
}
</script>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import useExpandTransition from '@/components/transition/use-expand-transition'

const BG_TYPE = ['primary', 'success', 'warning', 'danger', 'info']

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  icon: String,
  minimizable: {
    type: Boolean,
    default: true
  },
  width: Number,
  bgColor: String
})

const state = reactive({
  isMinimized: false
})

const cardClass = computed(() => {
  const cls = [] as string[]
  if (props.minimizable) {
    cls.push('minimizable')
  }
  if (state.isMinimized) {
    cls.push('is-minimized')
  }
  if (props.bgColor && BG_TYPE.includes(props.bgColor)) {
    cls.push('is-' + props.bgColor)
  }
  return cls
})

const cardStyle = computed(() => {
  const sty = {} as Record<string, string>
  sty.width = props.width ? props.width + 'px' : '100%'
  if (props.bgColor && !BG_TYPE.includes(props.bgColor)) {
    sty.backgroundColor = props.bgColor
  }
  return sty
})

const onMinBtnClick = () => {
  state.isMinimized = !state.isMinimized
}

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()
</script>

<style lang="scss">
@use 'src/assets/style/variable' as *;
@use 'src/assets/style/mixin' as *;

.fd-wg-panel {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 15px;
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-color-white);
  overflow: hidden;

  &.is-primary {
    background-color: var(--el-color-primary);
  }

  &.is-success {
    background-color: var(--el-color-success);
  }

  &.is-warning {
    background-color: var(--el-color-warning);
  }

  &.is-danger {
    background-color: var(--el-color-danger);
  }

  &.is-info {
    background-color: var(--el-color-info);
  }

  &__header {
    height: 45px;
    display: flex;
    align-items: center;
    color: var(--el-text-color-regular);
    font-size: var(--el-font-size-base);
    cursor: move;
  }

  &__icon {
    font-size: $icon-size-base;
    margin-right: 15px;
  }

  &__title {
    flex: 1;
    white-space: nowrap;
  }

  &__action {
    display: flex;
    align-items: center;
  }

  &__minimize {
    margin-left: 15px;
    color: var(--el-text-color-placeholder);

    .fd-icon {
      transition: transform var(--el-transition-duration);
      transform: rotate(-90deg);
    }
  }

  &__main {
    padding-top: 10px;
    @include expandTransition($default-transition-time);
  }

  &.is-minimized {
    .fd-wg-panel__minimize .fd-icon {
      transform: rotate(90deg);
    }
  }

  &:hover {
    box-shadow: var(--el-box-shadow-base);
  }
}
</style>
