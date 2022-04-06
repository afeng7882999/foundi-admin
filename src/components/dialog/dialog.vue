<template>
  <el-dialog
    v-bind="$attrs"
    ref="dialog"
    :custom-class="objClass"
    :draggable="true"
    :fullscreen="state.fullscreen"
    :close-on-click-modal="false"
    :title="title"
    :show-close="false"
    :width="width"
    @opened="onOpened"
  >
    <template #title>
      <div class="fd-dialog__title">
        <fd-icon class="title-icon" :icon="currentIcon"></fd-icon>
        <span class="title-text">{{ title }}</span>
        <div class="title-inner">
          <slot name="title" />
        </div>
        <el-tooltip :show-after="500" :content="state.fullscreen ? '还原' : '最大化'" effect="dark" placement="bottom">
          <fd-icon-button
            class="title-button"
            :icon="state.fullscreen ? 'off-screen-one' : 'full-screen-one'"
            @click="toggleFullscreen"
          ></fd-icon-button>
        </el-tooltip>
        <fd-icon-button class="title-button" icon="close-small" @click="hide"></fd-icon-button>
      </div>
    </template>
    <slot />
    <template #footer>
      <span class="fd-dialog__footer">
        <slot name="footer" />
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import FdIconButton from '@/components/icon-button/icon-button.vue'
import { ElDialog } from 'element-plus'
import useLayoutSize from '@/hooks/use-layout-size'
import { onBeforeRouteLeave } from 'vue-router'
import useView from '@/extend/page/use-view'

defineOptions({
  name: 'FdDialog',
  inheritAttrs: false
})

const props = defineProps({
  title: String,
  icon: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: '600px'
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  mobileCompact: {
    type: Boolean,
    default: true
  }
})

const dialog = ref<InstanceType<typeof ElDialog>>()

const state = reactive({
  fullscreen: false
})

watch(
  () => props.fullscreen,
  (val) => {
    state.fullscreen = !!val
  },
  { immediate: true }
)

const { isMobile } = useLayoutSize(props.mobileCompact)
const objClass = computed(() => {
  const clazz = ['fd-dialog']
  if (isMobile.value) {
    clazz.push('is-mobile')
  }
  return clazz.join(' ')
})

const { viewState } = useView()

const currentIcon = computed(() => {
  return props.icon ? props.icon : viewState.icon
})

const emit = defineEmits(['fullscreen'])
const toggleFullscreen = () => {
  state.fullscreen = !state.fullscreen
  emit('fullscreen', state.fullscreen)
}

const hide = () => {
  dialog.value?.close()
  goBackToHide.value = false
}

const goBackToHide = ref(false)
const onOpened = () => {
  goBackToHide.value = true
}
onBeforeRouteLeave((to) => {
  if (props.mobileCompact && goBackToHide.value) {
    hide()
    return false
  }
})

defineExpose({
  hide
})
</script>
