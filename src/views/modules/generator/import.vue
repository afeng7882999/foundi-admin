<template>
  <el-dialog
    v-model="state.visible"
    :close-on-click-modal="false"
    append-to-body
    title="导入表"
    top="5vh"
    width="80%"
    @close="hideDialog"
  >
    <el-form ref="queryForm" :inline="true" :model="state.query" size="medium">
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
      size="medium"
      @row-click="clickRow"
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="表名称" prop="tableName"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="表描述" prop="tableComment"></el-table-column>
      <el-table-column label="创建时间" prop="tableCreateTime">
        <template #default="scope">
          {{ dateTimeStr(scope.row.tableCreateTime) }}
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
      <span class="fd-dialog-footer">
        <el-button size="medium" type="primary" @click="importTableHandle">确 定</el-button>
        <el-button size="medium" @click="hideDialog">取 消</el-button>
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
import { genTableImportDb, genTableListDb } from '@/api/generator/gen-table'
import { ElMessage } from 'element-plus'
import { AnyObject } from '@/utils'

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

const { mixRefs, mixState: state, mixMethods } = useList(stateOption)
const { queryForm, table } = mixRefs
const { getList, dateTimeStr, pageChange, sizeChange, queryList, resetQuery, onSelectionChange } = mixMethods

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
const clickRow = (row: AnyObject) => {
  ;(table.value as any).toggleRowSelection(row)
}

defineExpose({
  open
})
</script>
