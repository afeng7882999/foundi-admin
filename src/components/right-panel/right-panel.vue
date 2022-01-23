<template>
  <el-drawer
    :model-value="modelValue"
    :custom-class="objClass"
    :with-header="false"
    :size="size"
    :close-on-click-modal="closeOnClickModal"
    :modal="modal"
    @closed="onClosed"
    @update:model-value="showOrHide"
  >
    <div class="fd-right-panel__content">
      <div class="fd-right-panel__title">
        <fd-icon-button class="title-button" icon="close-small" @click="hide"></fd-icon-button>
        <span class="title-text">{{ title }}</span>
      </div>
      <el-scrollbar :style="scrollbarStyle">
        <div class="fd-right-panel__main">
          <slot />
        </div>
      </el-scrollbar>
      <div class="fd-right-panel__footer">
        <slot name="footer" />
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts">
export default {
  name: 'FdRightPanel'
}
</script>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import usePage from '@/components/crud/use-page'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  customClass: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: '320px'
  },
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  modal: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'closed'])

const objClass = computed(() => {
  const clazz = ['fd-right-panel']
  if (props.customClass) {
    clazz.push(props.customClass)
  }
  if (useSlots().footer) {
    clazz.push('has-footer')
  }
  return clazz.join(' ')
})

const { getBodyHeight } = usePage()

const scrollbarStyle = computed(() => {
  const remove = useSlots().footer ? 116 : 50
  return { height: getBodyHeight(remove, 'px') }
})

const show = () => {
  emit('update:modelValue', true)
}

const hide = () => {
  emit('update:modelValue', false)
}

const onClosed = () => {
  emit('closed')
}

const showOrHide = (val: boolean) => {
  if (val) {
    show()
  } else {
    hide()
  }
}

defineExpose({
  show
})
</script>

<style lang="scss">
@use 'src/assets/style/variable' as *;

.fd-right-panel {
  .el-drawer__body {
    flex: 1;
    flex-direction: column;
    padding: 0;
  }

  &__content {
    height: 100%;
    color: var(--el-text-color-regular);

    .drawer-container {
      height: calc(100% - 50px);
    }
  }

  &__title {
    padding: 15px;
    display: flex;
    align-items: center;
    height: 50px;
    border-bottom: 1px solid var(--el-border-color-base);

    .title-text {
      flex: 1;
      text-align: center;
      font-size: $font-size-large;
    }

    .title-button {
      position: absolute !important;
      top: 10px;
      left: 15px;
    }
  }

  &__main {
    flex: 1;
    height: calc(100% - 116px);
    padding: 30px 20px;
  }

  &.has-footer {
    .fd-right-panel__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      .drawer-container {
        height: calc(100% - 106px);
      }
    }

    .fd-right-panel__footer {
      height: 66px;
      padding: 15px;
      border-top: 1px solid var(--el-border-color-base);
    }
  }

  &__footer {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
