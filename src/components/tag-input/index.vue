<template>
  <div ref="wrapper" class="fd-tag-input" :class="wrapperClass" @paste="pasteText">
    <div v-for="(item, index) in modelValue" :key="index" class="fd-tag-input__tags" :style="tagStyle">
      <span class="fd-tag-input__content">{{ item }}</span>
      <div class="fd-tag-input__act" @click="delTag(index)">
        <fd-icon icon="close-small"></fd-icon>
      </div>
    </div>
    <input
      ref="input"
      class="fd-tag-input__input"
      :style="inputStyle"
      type="text"
      placeholder="按 enter 创建"
      @keyup.enter.stop="addTag()"
      @keydown.delete="delTag()"
      @focus="focus(true)"
      @blur="focus(false)"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdTagInput'
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, PropType, reactive, ref } from 'vue'
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
