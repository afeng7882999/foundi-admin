<template>
  <el-dialog v-model="state.visible" :close-on-click-modal="false" append-to-body title="导入表" top="5vh" width="80%" @close="hideDialog">
    <el-form ref="queryForm" :inline="true" :model="state.query">
      <el-form-item label="表名称" prop="tableName">
        <el-input v-model="state.query.tableName" clearable placeholder="请输入表名称" @keyup.enter="queryList" />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input v-model="state.query.tableComment" clearable placeholder="请输入表描述" @keyup.enter="queryList" />
      </el-form-item>
      <el-form-item>
        <el-button v-waves type="primary" @click="queryList">
          <fd-icon icon="search" class="is-in-btn"></fd-icon>
          搜索
        </el-button>
        <el-button v-waves @click="resetQuery">
          <fd-icon icon="redo"></fd-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="table"
      v-loading="state.loading"
      :data="state.data"
      height="300px"
      @row-click="clickRow"
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="表名称" prop="tableName"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="表描述" prop="tableComment"></el-table-column>
      <el-table-column label="创建时间" prop="tableCreateTime">
        <template #default="scope">
          {{ formatTimestamp(scope.row.tableCreateTime) }}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :background="true"
      :current-page="state.current"
      :page-count="state.total"
      :page-size="state.size"
      :page-sizes="[10, 20, 50, 100]"
      :total="state.count"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="pageChange"
      @size-change="sizeChange"
    />
    <template #footer>
      <span class="fd-dialog__footer">
        <el-button type="primary" @click="importTableHandle">确 定</el-button>
        <el-button @click="hideDialog">取 消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'GeneratorImport'
}
</script>

<script setup lang="ts">
import useList from '@/components/crud/use-list'
import { GenTable, genTableImportDb, genTableListDb } from '@/api/generator/gen-table'
import { ElMessage } from 'element-plus'
import { formatTimestamp } from '@/utils/time'

const emit = defineEmits(['generator-imported'])

const stateOption = {
  listApi: genTableListDb,
  importApi: genTableImportDb,
  query: {
    tableName: undefined,
    tableComment: undefined
  },
  visible: false
}

const { mixRefs, mixState: state, mixMethods } = useList<GenTable>(stateOption)
const { queryForm, table } = mixRefs
const { getList, pageChange, sizeChange, queryList, resetQuery, onSelectionChange } = mixMethods

// 显示弹框
const open = () => {
  getList()
  state.visible = true
}

// 导入按钮操作
const importTableHandle = async () => {
  try {
    await state.importApi(state.selectedNodes.map((n) => n.tableName))
  } catch (e) {
    console.log(e)
  }
  state.visible = false
  emit('generator-imported')
  ElMessage({
    message: '操作成功',
    type: 'success',
    duration: 1500
  })
}

// 隐藏弹窗
const hideDialog = () => {
  state.visible = false
  ;(queryForm.value as any).resetFields()
}

// 单击行选中
const clickRow = (row: GenTable) => {
  ;(table.value as any).toggleRowSelection(row)
}

defineExpose({
  open
})
</script>
