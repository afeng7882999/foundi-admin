<template>
  <div class="fd-tag-input" :class="wrapperClass" @paste="pasteText" ref="wrapper">
    <div
      class="fd-tag-input__tags"
      v-for="(item, index) in modelValue"
      :key="index"
      :style="tagStyle"
    >
      <span class="fd-tag-input__content">{{ item }}</span>
      <div class="fd-tag-input__act" @click="delTag(index)">
        <fd-icon icon="close-small"></fd-icon>
      </div>
    </div>
    <input
      class="fd-tag-input__input"
      :style="inputStyle"
      type="text"
      placeholder="按 enter 创建"
      @keyup.enter.stop="addTag()"
      @keydown.delete="delTag()"
      @focus="focus(true)"
      @blur="focus(false)"
      ref="input"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdTagInput'
}
</script>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  reactive,
  ref,
  toRefs
} from 'vue'
import { addResizeListener, removeResizeListener } from '@/utils/resize-event'

const props = defineProps({
  // value of tag input
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => []
  }
})

const wrapper = ref()
const input = ref()

const state = reactive({
  size: 50,
  focused: false
})

const wrapperClass = computed(() => {
  return {
    focus: state.focused
  }
})

const tagStyle = computed(() => {
  return {
    maxWidth: `${state.size - 14}px`
  }
})

const inputStyle = computed(() => {
  return {
    maxWidth: `${state.size - 4}px`
  }
})

onMounted(() => {
  addResizeListener(wrapper.value as any, resizeHandle)
})

onBeforeUnmount(() => {
  removeResizeListener(wrapper.value as any, resizeHandle)
})

const emit = defineEmits(['update:modelValue'])

const pasteText = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text')
  if (text && text.trim() != '') {
    emit('update:modelValue', [...props.modelValue, text.trim()])
  }
}

const addTag = () => {
  const text = (input.value as HTMLInputElement).value
  if (text.trim() != '') {
    emit('update:modelValue', [...props.modelValue, text.trim()])
    ;(input.value as HTMLInputElement).value = ''
  }
}

const delTag = (index?: number) => {
  if (index === undefined) {
    const text = (input.value as HTMLInputElement).value
    if (props.modelValue.length >= 0 && text === '') {
      const result = props.modelValue.slice(0, props.modelValue.length - 1)
      emit('update:modelValue', result)
    }
  } else {
    const result = props.modelValue.filter((item, idx) => idx !== index)
    console.log(result)
    emit('update:modelValue', result)
  }
}

const focus = (ifFocused: boolean) => {
  state.focused = ifFocused
}

const resizeHandle = () => {
  state.size = (wrapper.value as HTMLElement).getBoundingClientRect().width
}
</script>

<style lang="scss">
@use 'src/assets/style/variable.scss' as *;

.fd-tag-input {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: center;
  width: 100% !important;
  height: 100% !important;
  min-height: 32px;
  background-color: var(--el-color-white);
  color: var(--el-text-color-regular);
  border-radius: var(--el-border-radius-base);
  border: var(--el-border-width-base) solid var(--el-border-color-base);
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  overflow: hidden;

  &:hover {
    border-color: var(--el-text-color-placeholder);
  }

  &.focus {
    border-color: var(--el-color-primary);
  }

  &__tags {
    display: flex;
    align-items: center;
    height: 24px;
    padding: 0 0 0 8px;
    box-sizing: border-box;
    border-radius: var(--el-border-radius-base);
    margin: 2px 0 2px 6px;
    color: var(--el-color-info);
    border-color: transparent;
    background-color: var(--el-color-gray-1);
  }

  &__content {
    flex: 1;
    height: 22px;
    line-height: 22px;
    font-size: 12px;
    color: var(--el-color-info);
    display: inline-block;
    text-overflow: ellipsis;
    overflow-x: hidden;
    vertical-align: bottom;
  }

  &__act {
    margin: 0 5px 0 8px;
    border-radius: 50%;
    text-align: center;
    cursor: pointer;
    height: 16px;
    width: 16px;
    line-height: 16px;

    &:hover {
      color: var(--el-color-gray-1);
      background-color: var(--el-text-color-placeholder);
    }
  }

  &__input {
    flex: 1;
    font-size: 14px;
    padding: 4px 15px 4px 15px;
    background-color: inherit;
    border: none;
    outline: none;
    color: inherit;

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }
  }
}

.el-form-item.is-error .fd-tag-input {
  border-color: var(--el-color-danger);
}
</style>
