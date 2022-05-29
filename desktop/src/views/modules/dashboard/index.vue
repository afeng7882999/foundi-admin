<template>
  <div class="page-dashboard fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <el-row :gutter="8">
      <el-col :xs="24" :sm="12" :md="6">
        <fd-widget-card
          icon="chart-pie-one"
          content="200"
          sub="%"
          type="primary"
          more-url="/system/user"
          desc="一个月内注册的用户"
        ></fd-widget-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <fd-widget-card
          icon="chart-pie-one"
          content="200"
          sub="%"
          type="success"
          more-url="/system/user"
          desc="一个月内注册的用户"
        ></fd-widget-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <fd-widget-card
          icon="chart-pie-one"
          content="200"
          sub="%"
          type="warning"
          more-url="/system/user"
          desc="一个月内注册的用户"
        ></fd-widget-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <fd-widget-card
          icon="chart-pie-one"
          content="200"
          sub="%"
          type="info"
          more-url="/system/user"
          desc="一个月内注册的用户"
        ></fd-widget-card>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="16">
        <widget-content-stat></widget-content-stat>
        <widget-region></widget-region>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8">
        <widget-watch></widget-watch>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useStore } from '@/store'
import FdWidgetCard from './widgets/card.vue'
import WidgetContentStat from './widgets/content-stat.vue'
import WidgetRegion from './widgets/region.vue'
import WidgetWatch from './widgets/watch.vue'

defineOptions({
  name: 'Dashboard'
})

const state = reactive({
  app: ''
})

const storeState = useStore().state

const showPageHeader = computed(() => {
  return !storeState.app.enableTags
})
</script>

<style lang="scss">
.fd-wg-card {
  margin-bottom: 8px;
}

.fd-wg-panel {
  margin-bottom: 8px;
}
</style>
