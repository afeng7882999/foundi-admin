<template>
  <el-button class="fd-count-down-button" v-bind="buttonProp" :disabled="disabledCom">
    {{ state.btnText }}
  </el-button>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

defineOptions({
  name: 'FdCountDownButton'
})

const props = defineProps({
  disableTime: {
    type: Number,
    default: 10
  },
  text: {
    type: String,
    default: '发送验证码'
  },
  prompt: {
    type: String,
    default: '秒后重新发送'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  buttonProp: {
    type: Object
  }
})

const state = reactive({
  btnText: props.text,
  btnCount: props.disableTime,
  btnDisabled: false
})

const disabledCom = computed(() => {
  return props.disabled || state.btnDisabled
})

const countDown = () => {
  state.btnDisabled = true
  state.btnCount = props.disableTime
  state.btnText = props.disableTime + props.prompt
  const clock = window.setInterval(() => {
    state.btnCount--
    state.btnText = state.btnCount + props.prompt
    if (state.btnCount < 0) {
      window.clearInterval(clock)
      state.btnText = props.text
      state.btnDisabled = false
    }
  }, 1000)
}

defineExpose({
  countDown
})
</script>
