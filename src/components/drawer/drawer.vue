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
    <div class="fd-drawer__content">
      <div class="fd-drawer__title">
        <fd-icon class="title-icon" :icon="currentIcon"></fd-icon>
        <span class="title-text">{{ title }}</span>
        <fd-icon-button class="title-button" icon="close-small" @click="hide"></fd-icon-button>
      </div>
      <el-scrollbar :style="scrollbarStyle">
        <div class="fd-drawer__main">
          <slot />
        </div>
      </el-scrollbar>
      <div class="fd-drawer__footer">
        <slot name="footer" />
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts">
export default {
  name: 'FdDrawer'
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
  icon: {
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
  const clazz = ['fd-drawer']
  if (props.customClass) {
    clazz.push(props.customClass)
  }
  if (useSlots().footer) {
    clazz.push('has-footer')
  }
  return clazz.join(' ')
})

const { pageState, getBodyHeight } = usePage()

const scrollbarStyle = computed(() => {
  const remove = useSlots().footer ? 126 : 50
  return { maxHeight: getBodyHeight(remove, 'px') }
})

const currentIcon = computed(() => {
  return props.icon ? props.icon : pageState.icon
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
  show,
  hide
})
</script>

<style lang="scss">
@use 'src/assets/style/variable' as *;

.fd-drawer {
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
    padding: 15px 20px;
    display: flex;
    height: 50px;

    .title-icon {
      font-size: 24px;
      margin-right: 10px;
      align-self: center;
    }

    .title-text {
      text-align: center;
      font-size: $font-size-large;
    }

    .title-button {
      position: absolute !important;
      top: 10px;
      right: 15px;
    }
  }

  &__main {
    flex: 1;
    max-height: calc(100% - 126px);
    padding: 30px 20px 20px 20px;
  }

  &.has-footer {
    .fd-drawer__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      .drawer-container {
        height: calc(100% - 106px);
      }
      .el-scrollbar {
        height: auto;
      }
    }

    .fd-drawer__footer {
      height: 76px;
      padding: 20px;
    }
  }

  &__footer {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
  }
}
</style>
