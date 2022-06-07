<template>
  <el-dialog v-model="state.visible" :close-on-click-modal="false" :title="title" class="user-agreement-dialog" width="800px">
    <div class="agreement-content">
      <el-scrollbar v-if="state.showAgreement" class="agreement-content__scroll">
        <div class="agreement-content__text" v-html="state.agreement"></div>
      </el-scrollbar>
      <el-scrollbar v-else class="agreement-content__scroll">
        <div class="agreement-content__text" v-html="state.privacy"></div>
      </el-scrollbar>
    </div>
    <template #footer>
      <span class="fd-dialog__footer">
        <el-button type="primary" @click="state.visible = false">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'UserAgreementDialog'
}
</script>

<script lang="ts" setup>
import { computed, onMounted, reactive, toRefs } from 'vue'
import { getAgreement } from '@b/api/system/login'

const state = reactive({
  agreement: '',
  privacy: '',
  showAgreement: true,
  visible: false
})

const title = computed(() => {
  return state.showAgreement ? '用户协议' : '隐私政策'
})

onMounted(async () => {
  try {
    const { agreement, privacy } = await getAgreement()
    state.agreement = agreement
    state.privacy = privacy
  } catch (e) {
    console.log(e)
  }
})

const show = (showAgreement: true) => {
  state.showAgreement = showAgreement
  state.visible = true
}

// eslint-disable-next-line no-undef
defineExpose({
  ...toRefs(state),
  show
})
</script>

<style lang="scss" scoped>
@use '../base/src/assets/style/variable.scss' as *;

.agreement-content {
  display: block;
  height: 500px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);

  .agreement-content__scroll {
    padding: 0 20px;
  }
}
</style>
