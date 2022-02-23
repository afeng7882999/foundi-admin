<template>
  <div v-if="hasAuth('demo:table:list')" :style="docMinHeight" class="page-demo-table fd-page">
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
</template>

<script lang="ts">
export default {
  name: 'DemoTable'
}
</script>

<script setup lang="ts">
import BaseTableDemo from './base.vue'
import TreeTableDemo from './tree.vue'
import usePage from '@/components/crud/use-page'

const { docMinHeight, showPageHeader, hasAuth } = usePage()
</script>
