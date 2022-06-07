<template>
  <div class="fd-wg-card" :class="cardClass" :style="cardStyle" @click="onCardClick">
    <div class="fd-wg-card__icon">
      <fd-icon :icon="props.icon"></fd-icon>
    </div>
    <div class="fd-wg-card__main">
      <span class="fd-wg-card__desc">
        {{ props.desc }}
      </span>
      <span class="fd-wg-card__content">
        {{ props.content }}
        <sub v-show="ifShowSub">
          {{ props.sub }}
        </sub>
      </span>
    </div>
    <div class="fd-wg-card__more">
      <div v-show="ifShowMore" class="more__inner" @click="onMoreClick">
        <fd-icon icon="right-c"></fd-icon>
        <span>更多</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'FdWidgetCard'
})

const props = defineProps({
  width: Number,
  type: {
    type: String as PropType<'plain' | 'primary' | 'success' | 'warning' | 'danger' | 'info'>,
    validator(val?: string) {
      if (val) {
        return ['plain', 'primary', 'success', 'warning', 'danger', 'info'].includes(val)
      }
      return true
    }
  },
  content: {
    type: String,
    default: '100'
  },
  sub: String,
  desc: String,
  icon: {
    type: String,
    default: 'folder-close'
  },
  moreUrl: String
})

const cardStyle = computed(() => {
  const sty = {} as Record<string, string>
  sty.width = props.width ? props.width + 'px' : '100%'
  return sty
})

const cardClass = computed(() => {
  const cls = [] as string[]
  if (props.type) {
    cls.push('is-' + props.type)
  }
  return cls
})

const ifShowSub = computed(() => {
  return !!props.sub
})

const ifShowMore = computed(() => {
  return !!props.moreUrl
})

const emit = defineEmits(['card-click', 'more-click'])

const onCardClick = () => {
  emit('card-click')
}

const router = useRouter()

const onMoreClick = () => {
  if (props.moreUrl) {
    router.push(props.moreUrl)
    emit('more-click')
  }
}
</script>

<style lang="scss">
@use '../base/src/assets/style/variable' as *;

.fd-wg-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-items: flex-start;
  position: relative;
  height: 120px;
  color: var(--el-text-color-regular);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-color-white);
  overflow: hidden;
  cursor: pointer;

  &:hover {
    box-shadow: var(--el-box-shadow);
  }

  &.is-primary {
    .fd-wg-card__icon {
      color: var(--el-color-primary);
    }
  }

  &.is-success {
    .fd-wg-card__icon {
      color: var(--el-color-success);
    }
  }

  &.is-warning {
    .fd-wg-card__icon {
      color: var(--el-color-warning);
    }
  }

  &.is-danger {
    .fd-wg-card__icon {
      color: var(--el-color-danger);
    }
  }

  &.is-info {
    .fd-wg-card__icon {
      color: var(--el-color-info);
    }
  }

  &__icon {
    position: absolute;
    top: 16px;
    left: 16px;
    font-size: 46px;
    color: rgba(0, 0, 0, 0.15);
    z-index: 0;
    transition: transform var(--el-transition-duration);
  }

  &__main {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 16px 16px 0 16px;

    &:after {
      content: '';
      height: 1px;
      padding: 0 16px;
      border-bottom: 1px solid var(--el-border-color-light);
    }
  }

  &__content {
    margin: 0 0 16px;
    padding: 0;
    font-size: 32px;
    font-weight: 700;
    white-space: nowrap;
    line-height: 30px;
    text-align: right;

    sub {
      position: relative;
      top: -8px;
      left: -5px;
      font-size: 60%;
    }
  }

  &__desc {
    margin: 0 0 5px;
    font-size: var(--el-font-size-small);
    text-align: right;
  }

  &__more {
    flex: 1;
    padding: 8px 16px 0 16px;
    color: var(--el-text-color-secondary);

    &:hover {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .more__inner {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: var(--el-font-size-small);

      .fd-icon {
        margin: 0 5px 0;
        font-size: 18px;
      }
    }
  }
}
</style>
