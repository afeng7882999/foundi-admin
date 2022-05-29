<template>
  <div class="page-error-404">
    <span class="page-error-404__title">OOPS! PAGE NOT FOUND</span>
    <div class="page-error-404__icon vivify flipInX">
      <fd-svg-image img="404"></fd-svg-image>
    </div>
    <span class="page-error-404__desc">对不起, 您访问的页面不存在, 您可以返回上一页, 或回到首页</span>
    <div class="page-error-404__act">
      <component :is="buttonCom" type="info" block @click="goBack">
        <fd-icon class="is-in-btn" icon="left"></fd-icon>
        返回上一页
      </component>
      <component :is="buttonCom" type="primary" block @click="goHome">
        <fd-icon class="is-in-btn" icon="home"></fd-icon>
        回到首页
      </component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { getDeviceSize } from '@b/hooks/use-layout-size'
import { DeviceType } from '@b/store/modules/app'

defineOptions({
  name: '404'
})

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/dashboard')
}

const buttonCom = computed(() => {
  return getDeviceSize() === DeviceType.Mobile ? 'van-button' : 'el-button'
})
</script>

<style lang="scss">
@use '../base/src/assets/style/variable' as *;

.page-error-404 {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--el-body-bg-color);

  &__title {
    text-align: center;
    color: var(--el-text-color-primary);
  }

  &__icon {
    display: flex;
    color: var(--el-color-warning);
  }

  &__desc {
    text-align: center;
    color: var(--el-text-color-primary);
    padding: 20px 0 40px 0;
  }
}
</style>
