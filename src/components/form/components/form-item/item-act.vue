<template>
  <el-form-item>
    <el-button plain type="primary" @click="actionEmit('query')">
      <fd-icon icon="search" class="is-in-btn"></fd-icon>
      查询
    </el-button>
    <el-button @click="actionEmit('reset')">
      <fd-icon icon="refresh" class="is-in-btn"></fd-icon>
      重置
    </el-button>
  </el-form-item>
</template>

<script lang="ts">
export default {
  name: 'FdItemAct',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
const emit = defineEmits(['query', 'reset'])
const actionEmit = (event: 'query' | 'reset') => {
  emit(event)
}
</script>
