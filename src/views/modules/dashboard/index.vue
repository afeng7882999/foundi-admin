<template>
  <div class="page-dashboard fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <el-row :gutter="15">
      <el-col :xs="12" :sm="12" :md="6">
        <fd-widget-card
          icon="chart-pie-one"
          content="200"
          sub="%"
          type="primary"
          more-url="/system/user"
          desc="一个月内注册的用户"
        ></fd-widget-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <fd-widget-card
          icon="chart-pie-one"
          content="200"
          sub="%"
          type="success"
          more-url="/system/user"
          desc="一个月内注册的用户"
        ></fd-widget-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <fd-widget-card
          icon="chart-pie-one"
          content="200"
          sub="%"
          type="warning"
          more-url="/system/user"
          desc="一个月内注册的用户"
        ></fd-widget-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
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
    <el-row :gutter="15">
      <el-col :xs="24" :sm="24" :md="16">
        <widget-visitor></widget-visitor>
        <widget-region></widget-region>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8">
        <widget-watch></widget-watch>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
export default {
  name: 'Dashboard'
}
</script>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import FdWidgetCard from './widgets/card.vue'
import WidgetVisitor from './widgets/visitor.vue'
import WidgetRegion from './widgets/region.vue'
import WidgetWatch from './widgets/watch.vue'

const state = reactive({
  app: ''
})

const storeState = useStore<AllState>().state as AllState

const pageMinHeight = computed(() => {
  const height = storeState.app.docHeight - 20
  return { minHeight: height + 'px' }
})

const showPageHeader = computed(() => {
  return !storeState.app.enableTags
})
</script>

<style lang="scss">
.fd-wg-card {
  margin-bottom: 15px;
}

.fd-wg-panel {
  margin-bottom: 15px;
}
</style>
