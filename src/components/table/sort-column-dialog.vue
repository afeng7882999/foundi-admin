<template>
  <el-dialog v-model="state.visible" :close-on-click-modal="false" title="排序">
    <el-table :data="state.tableColumns" row-key="id">
      <el-table-column label="显示" prop="visible">
        <template #default="scope">
          <el-checkbox v-model="scope.row.visible"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="属性" prop="property"></el-table-column>
      <el-table-column label="列名" prop="label"></el-table-column>
      <el-table-column label="类型" prop="type"></el-table-column>
    </el-table>
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button size="medium" @click="reset">重置</el-button>
        <el-button size="medium" type="primary" @click="submit">排序</el-button>
        <el-button size="medium" @click="state.visible = false">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'FdSortColumnDialog'
}
</script>

<script setup lang="ts">
import { reactive } from 'vue'
import { TableColumn } from '@/components/table/use-table'

const state = reactive({
  visible: false,
  tableColumns: [] as TableColumn[]
})

const open = (tableColumns: TableColumn[]) => {
  state.tableColumns = tableColumns
  state.visible = true
}

const emit = defineEmits(['submit'])

const submit = () => {
  emit('submit', state.tableColumns)
  state.visible = false
}

const reset = () => {
  console.log('reset')
}

defineExpose({
  open
})
</script>
