<template>
  <div class="page-error-404">
    <span class="error-title">OOPS! PAGE NOT FOUND</span>
    <div class="error-icon vivify flipInX">
      <fd-svg-image img="graphics-404"></fd-svg-image>
    </div>
    <span class="error-desc">对不起, 您访问的页面不存在, 您可以返回上一页, 或回到首页</span>
    <div class="error-act">
      <el-button class="act-back" size="medium" type="info" @click="goBack">
        <fd-icon class="in-button" icon="left"></fd-icon>
        返回上一页
      </el-button>
      <el-button class="act-home" size="medium" type="primary" @click="goHome">
        <fd-icon class="in-button" icon="home"></fd-icon>
        回到首页
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'NotFound',
  setup() {
    const router = useRouter()

    const goBack = () => {
      router.go(-1)
    }

    const goHome = () => {
      router.push('/dashboard')
    }

    return {
      goBack,
      goHome
    }
  }
})
</script>

<style lang="scss" scoped>
@use 'src/assets/style/variable' as *;
@use 'src/assets/style/color' as *;

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
  background-color: var(--fd-body-background-color);

  .error-title {
    text-align: center;
    color: var(--el-text-color-primary);
  }

  .error-icon {
    display: flex;
    color: var(--el-color-warning);
  }

  .error-desc {
    text-align: center;
    color: var(--el-text-color-primary);
    padding: 20px 0 40px 0;
  }

  .error-act {
    .act-back {
    }
  }
}
</style>
