<template>
  <div class="fd-qrcode" :style="qrcodeStyle" @click="onCodeClick">
    <qrcode-vue :value="state.codeVal" :size="state.codeSize" render-as="svg"></qrcode-vue>
    <div class="fd-qrcode__invalid" v-show="state.expired">
      <span>失效，点击刷新</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import QrcodeVue from 'qrcode.vue'

defineOptions({
  name: 'FdQrcode'
})

const props = defineProps({
  // 二维码内容
  code: {
    type: String,
    default: 'https://www.npmjs.com/package/qrcode.vue'
  },
  // 宽高
  size: {
    type: Number,
    default: 240
  },
  // 失效时间（秒）
  expire: {
    type: Number,
    default: -1
  }
})

const state = reactive({
  codeVal: props.code,
  codeSize: props.size - 20,
  expired: false
})

const qrcodeStyle = computed(() => {
  return {
    width: props.size + 'px',
    height: props.size + 'px',
    padding: '10px'
  }
})

watch(
  () => props.code,
  (val: string) => {
    if (val) {
      refresh(val)
    }
  }
)

onMounted(() => {
  state.expired = false
  countDown()
})

const emit = defineEmits(['refresh-click'])

const onCodeClick = () => {
  emit('refresh-click')
}

const refresh = (code: string) => {
  state.codeVal = code
  state.expired = false
  countDown()
}

let timeout = 0
const countDown = () => {
  if (props.expire > 0) {
    if (timeout) {
      window.clearTimeout(timeout)
    }
    timeout = window.setTimeout(() => {
      state.expired = true
    }, props.expire * 1000)
  }
}

defineExpose({
  refresh
})
</script>

<style lang="scss" scoped>
@use 'src/assets/style/variable' as *;

.fd-qrcode {
  position: relative;
  padding: 10px;
  cursor: pointer;
  border: 1px solid var(--el-border-color-base);

  &:hover {
    box-shadow: $box-shadow-base;
  }

  .fd-qrcode__invalid {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.8);
    font-size: $font-size-small;

    span {
      flex: 1;
      text-align: center;
      padding: 5px;
      background-color: #fff;
    }
  }
}
</style>
