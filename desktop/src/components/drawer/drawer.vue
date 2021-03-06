<template>
  <el-drawer
    v-bind="$attrs"
    ref="drawer"
    :custom-class="objClass"
    :with-header="false"
    :size="size"
    :close-on-click-modal="closeOnClickModal"
    :modal="modal"
    @opened="onOpened"
  >
    <div class="fd-drawer__content">
      <div class="fd-drawer__title">
        <fd-icon class="title-icon" :icon="currentIcon"></fd-icon>
        <span class="title-text">{{ title }}</span>
        <fd-button type="icon" class="title-button" icon="close" @click="hide"></fd-button>
      </div>
      <el-scrollbar class="fd-drawer__scroll" :style="scrollbarStyle">
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

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'
import usePage from '@/crud/hooks/use-page'
import { ElDrawer } from 'element-plus'
import { onBeforeRouteLeave } from 'vue-router'
import useView from '@b/crud/hooks/use-view'

defineOptions({
  name: 'FdDrawer',
  inheritAttrs: false
})

const props = defineProps({
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
    default: false
  },
  modal: {
    type: Boolean,
    default: false
  }
})

const drawer = ref<InstanceType<typeof ElDrawer>>()

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

const { getBodyHeight } = usePage()

const { viewState } = useView()

const scrollbarStyle = computed(() => {
  const remove = useSlots().footer ? 142 : 62
  return { maxHeight: getBodyHeight(remove, 'px') }
})

const currentIcon = computed(() => {
  return props.icon ? props.icon : viewState.icon
})

const hide = () => {
  goBackToHide.value = false
  drawer.value?.handleClose()
}

const goBackToHide = ref(false)
const onOpened = () => {
  goBackToHide.value = true
}
onBeforeRouteLeave((to) => {
  if (goBackToHide.value) {
    hide()
    return false
  }
})

defineExpose({
  hide
})
</script>
