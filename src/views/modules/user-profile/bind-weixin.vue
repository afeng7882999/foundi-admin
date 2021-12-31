<template>
  <el-dialog v-model="state.visible" :append-to-body="true" title="绑定微信">
    <div class="qrcode">
      <fd-qrcode ref="qrcode" :expire="120" @click="refreshQrcode"></fd-qrcode>
      <span>请使用微信扫码登录, 点击刷新</span>
    </div>
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button @click="state.visible = false">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'BindWeixinDialog'
}
</script>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import FdQrcode from '@/components/qrcode/index.vue'
import { getWeixinUrl } from '@/api/system/login'
import settings from '@/app/settings'
import { currentBindWeixin } from '@/api/system/user'
import { ElMessage } from 'element-plus'

const DEFAULT_CHECK_INTERVAL = 2000

const qrcode = ref()

const state = reactive({
  visible: false,
  clockForBind: null as number | null
})

watch(
  () => state.visible,
  (val: boolean) => {
    if (!val) {
      clearClock()
    }
  }
)

onBeforeUnmount(() => {
  clearClock()
})

const open = async () => {
  await refreshQrcode()
  state.visible = true
}

const refreshQrcode = async () => {
  try {
    const { authzUrl, state } = await getWeixinUrl(settings.appName)
    if (authzUrl && state) {
      ;(qrcode.value as any).refresh(authzUrl)
      await nextTick(() => {
        checkAuthc(state)
      })
    }
  } catch (e) {
    console.log(e)
  }
}

const emit = defineEmits(['refresh-data-list'])

const checkAuthc = async (checkState: string) => {
  clearClock()
  state.clockForBind = window.setInterval(async () => {
    try {
      const success = await currentBindWeixin(checkState)
      if (success) {
        clearClock()
        emit('refresh-data-list')
        state.visible = false
        ElMessage({
          message: '操作成功',
          type: 'success',
          duration: 1500
        })
      }
    } catch (e) {
      clearClock()
      state.visible = false
    }
  }, DEFAULT_CHECK_INTERVAL)
}

const clearClock = () => {
  if (state.clockForBind) {
    window.clearInterval(state.clockForBind)
  }
}
</script>

<style lang="scss" scoped>
@use 'src/assets/style/variable' as *;

.qrcode {
  display: flex;
  padding: 10px 0;
  flex-direction: column;
  align-items: center;
  user-select: none;

  span {
    margin-top: 20px;
    font-size: $font-size-small;
    color: $color-text-secondary;
  }
}
</style>
