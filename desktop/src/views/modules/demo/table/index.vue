<template>
  <div v-if="auth('demo:table:list')" :style="docMinHeight" class="page-demo-table fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <el-tabs>
      <el-tab-pane label="基础表格">
        <base-table-demo></base-table-demo>
      </el-tab-pane>
      <el-tab-pane label="树状表格">
        <tree-table-demo></tree-table-demo>
      </el-tab-pane>
    </el-tabs>
  </div>
  <fd-page-footer></fd-page-footer>
</template>

<script setup lang="ts">
import BaseTableDemo from './base.vue'
import TreeTableDemo from './tree.vue'
import usePage from '@/crud/hooks/use-page'
import FdPageFooter from '@/crud/page/page-footer.vue'

defineOptions({
  name: 'DemoTable'
})

const { docMinHeight, showPageHeader, auth } = usePage()
</script>
