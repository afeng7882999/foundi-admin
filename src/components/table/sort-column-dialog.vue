<template>
  <el-dialog v-model="state.visible" :close-on-click-modal="false" title="表格列设置" width="650px">
    <div ref="tableWrapper">
      <el-table ref="table" v-bind="tableAttrs" stripe>
        <el-table-column class-name="sortable-drag" label="" width="38">
          <template #default>
            <el-tooltip content="拖动排序当前行" placement="left">
              <span><fd-icon icon="drag"></fd-icon></span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="显示" prop="visible" width="80">
          <template #header="scope">
            <div class="sort-column-dlg__header-check">
              <el-checkbox :model-value="selectAll" :indeterminate="selectPart" @change="onSelectAllChange"></el-checkbox>
              {{ scope.column.label }}
            </div>
          </template>
          <template #default="scope">
            <el-checkbox v-model="scope.row.visible"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="属性" prop="property" :formatter="colEmptyFormatter"></el-table-column>
        <el-table-column label="列名" prop="label" :formatter="colEmptyFormatter"></el-table-column>
        <el-table-column label="类型" prop="type" width="100"></el-table-column>
      </el-table>
    </div>
    <template #footer>
      <div class="fd-dialog-footer">
        <div class="fd-dialog-footer__right">
          <el-button size="medium" @click="reset">重置</el-button>
        </div>
        <el-button size="medium" type="primary" @click="submit">设置</el-button>
        <el-button size="medium" @click="state.visible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'FdSortColumnDialog'
}
</script>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import useTable from '@/components/table/use-table'
import { TableColumn } from '@/components/table/types'

const tableWrapper = ref()
const table = ref()

const state = reactive({
  visible: false,
  tableColumns: [] as TableColumn[]
})

const selectAll = computed(() => {
  return !state.tableColumns.some((c) => c.visible === false)
})

const selectPart = computed(() => {
  const len = state.tableColumns.filter((c) => c.visible === true).length
  return len !== 0 && len !== state.tableColumns.length
})

const onSelectAllChange = (val: boolean) => {
  if (val) {
    state.tableColumns.forEach((c) => (c.visible = true))
  } else {
    state.tableColumns.forEach((c) => (c.visible = false))
  }
}

const { tableAttrs } = useTable(table, tableWrapper, { data: () => state.tableColumns, configurable: false, rowDraggable: true })

const open = (tableColumns: TableColumn[]) => {
  state.tableColumns = tableColumns
  state.visible = true
}

const emit = defineEmits(['submit', 'reset'])

const submit = () => {
  emit('submit', state.tableColumns)
  state.visible = false
}

const reset = () => {
  state.tableColumns.sort((a, b) => a.id - b.id)
  state.tableColumns.forEach((c) => (c.visible = true))
}

const colEmptyFormatter = (row: any, column: any, cellValue: any) => {
  return cellValue ? cellValue : '无'
}

defineExpose({
  open
})
</script>

<style lang="scss">
.sort-column-dlg {
  &__header-check {
    display: flex;
    align-items: center;
    .el-checkbox {
      margin-right: 8px;
    }
  }
}
</style>
