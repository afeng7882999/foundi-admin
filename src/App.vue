<template>
  <el-config-provider :locale="locale" :size="size">
    <div id="app">
      <router-view></router-view>
    </div>
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/lib/locale/lang/zh-cn'

export default defineComponent({
  name: 'App',
  components: {
    ElConfigProvider
  },
  setup() {
    return {
      locale: zhCn,
      size: 'default'
    }
  }
})
</script>
