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

<script lang="ts">
export default {
  name: 'FdDialog',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import FdIconButton from '@/components/icon-button/icon-button.vue'
import { ElDialog } from 'element-plus'
import usePage from '@/extend/page/use-page'
import useBreakpoint from '@/hooks/use-breakpoint'

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

const { isMobile } = useBreakpoint()
const objClass = computed(() => {
  const clazz = ['fd-dialog']
  if (props.mobileCompact && isMobile.value) {
    clazz.push('is-mobile')
  }
  return clazz.join(' ')
})

const { pageState } = usePage()

const currentIcon = computed(() => {
  return props.icon ? props.icon : pageState.icon
})

const toggleFullscreen = () => {
  state.fullscreen = !state.fullscreen
}

const hide = () => {
  dialog.value?.close()
}
</script>
