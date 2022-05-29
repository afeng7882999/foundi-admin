<template>
  <el-dialog v-model="state.visible" :close-on-click-modal="false" title="表格列设置" width="700px">
    <div ref="tableWrapper" class="fd-page__table is-den-high">
      <el-table ref="table" :data="state.tableColumns" stripe>
        <el-table-column class-name="sortable-drag" label="" width="38">
          <template #default>
            <el-tooltip content="拖动排序当前行" :show-after="500" placement="left">
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
        <el-table-column label="左侧固定" prop="visible" width="80">
          <template #default="scope">
            <el-checkbox
              :model-value="scope.row.fixed === 'left' || scope.row.fixed === true"
              @change="changeFixed(scope.row, 'left')"
            ></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="右侧固定" prop="visible" width="80">
          <template #default="scope">
            <el-checkbox :model-value="scope.row.fixed === 'right'" @change="changeFixed(scope.row, 'right')"></el-checkbox>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <div class="fd-dialog__footer">
        <div class="fd-dialog__footer is-right">
          <el-button @click="reset">重置</el-button>
        </div>
        <el-button type="primary" @click="submit">设置</el-button>
        <el-button @click="state.visible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import useSortableRow from '../hooks/use-sortable-row'
import { TableColumn } from '../types'

defineOptions({
  name: 'FdSortColumnDialog'
})

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

const changeFixed = (row: TableColumn, fixed: 'left' | 'right') => {
  if (row.fixed === true || row.fixed === 'left') {
    row.fixed = fixed === 'left' ? false : 'right'
    return
  }
  if (row.fixed === 'right') {
    row.fixed = fixed === 'right' ? false : 'left'
    return
  }
  row.fixed = fixed
}

useSortableRow(table, {
  data: () => state.tableColumns,
  rowDraggable: true
})

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
  state.tableColumns.forEach((c) => (c.fixed = c.oldFixed))
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
