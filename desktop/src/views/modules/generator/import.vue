<template>
  <fd-dialog v-model="s.visible" title="导入表" top="5vh" width="900px" @close="hideDialog">
    <div class="fd-page-toolbar">
      <div class="query-compact">
        <el-form ref="queryForm" compact inline :model="s.query" :submit-fn="m.queryList">
          <fd-item label="表名称" prop="tableName" />
          <fd-item label="表描述" prop="tableComment" />
        </el-form>
      </div>
      <div class="fd-page-toolbar__right">
        <el-button v-waves type="primary" @click="m.queryList">
          <fd-icon icon="search" class="is-in-btn"></fd-icon>
          搜索
        </el-button>
        <el-button v-waves @click="reset">
          <fd-icon icon="redo" class="is-in-btn"></fd-icon>
          重置
        </el-button>
      </div>
    </div>
    <div class="fd-page__table is-bordered is-den-high">
      <el-table ref="table" v-loading="s.loading" :data="s.data" stripe @row-click="clickRow" @selection-change="m.onSelectionChange">
        <fd-col-selection />
        <fd-col label="表名称" prop="tableName" min-width="200" />
        <fd-col label="表描述" prop="tableComment" min-width="200" />
        <fd-col-datetime label="创建时间" prop="tableCreateTime" />
      </el-table>
      <el-pagination class="fd-pagination" v-bind="paginationAttrs" />
    </div>
    <template #footer>
      <span class="fd-dialog__footer">
        <el-button type="primary" @click="importTableHandle">确定</el-button>
        <el-button @click="hideDialog">取消</el-button>
      </span>
    </template>
  </fd-dialog>
</template>

<script setup lang="ts">
import useList from '@/crud/hooks/use-list'
import { GenTable, genTableImportDb, genTableListDb } from '@b/api/generator/gen-table'
import { ElForm, ElMessage } from 'element-plus'
import { debugWarn } from '@b/common/exception'
import { ref } from 'vue'

defineOptions({
  name: 'GeneratorImport'
})

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

const { listRefs, listState: s, listMethods: m, listAttrs } = useList<GenTable>(stateOption)
const { table } = listRefs
const { paginationAttrs } = listAttrs

const open = () => {
  m.getList()
  s.visible = true
}

const queryForm = ref<InstanceType<typeof ElForm>>()
const reset = () => {
  queryForm.value?.resetFields()
  s.query.sort = []
  m.queryList()
}

const importTableHandle = async () => {
  if (!s.selectedNodes?.length) {
    return
  }
  try {
    await s.importApi(s.selectedNodes.map((n) => n.tableName))
  } catch (e) {
    debugWarn('GeneratorImport', (e as Error).message)
  }
  s.visible = false
  emit('generator-imported')
  ElMessage({
    message: '操作成功',
    type: 'success',
    duration: 1500
  })
}

const hideDialog = () => {
  s.visible = false
  queryForm.value?.resetFields()
}

const clickRow = (row: GenTable) => {
  table.value?.store.toggleRowSelection(row)
}

defineExpose({
  open
})
</script>
