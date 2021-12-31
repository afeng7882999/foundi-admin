<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" append-to-body title="导入表" top="5vh" width="80%" @close="hideDialog">
    <el-form ref="queryForm" :inline="true" :model="query" size="medium">
      <el-form-item label="表名称" prop="tableName">
        <el-input v-model="query.tableName" clearable placeholder="请输入表名称" @keyup.enter="queryList" />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input v-model="query.tableComment" clearable placeholder="请输入表描述" @keyup.enter="queryList" />
      </el-form-item>
      <el-form-item>
        <el-button v-waves icon="el-icon-search" type="primary" @click="queryList">搜索</el-button>
        <el-button v-waves icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="table" v-loading="loading" :data="data" height="260px" size="medium" @row-click="clickRow" @selection-change="onSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="表名称" prop="tableName"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="表描述" prop="tableComment"></el-table-column>
      <el-table-column label="创建时间" prop="tableCreateTime"></el-table-column>
    </el-table>
    <el-pagination :background="true" :current-page="current" :page-count="total" :page-size="size" :page-sizes="[10, 20, 50, 100]" :total="count" layout="total, sizes, prev, pager, next, jumper" @current-change="pageChange" @size-change="sizeChange" />
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button size="medium" type="primary" @click="importTableHandle">确 定</el-button>
        <el-button size="medium" @click="hideDialog">取 消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useList from '@/components/crud/use-list'
import { genTableImportDb, genTableListDb } from '@/api/generator/gen-table'
import { ElMessage } from 'element-plus'
import { AnyObject } from '@/utils'

export default defineComponent({
  name: 'GeneratorImport',
  emits: ['generator-imported'],
  setup(props, { emit }) {
    const stateOption = {
      listApi: genTableListDb,
      importApi: genTableImportDb,
      query: {
        tableName: undefined,
        tableComment: undefined
      },
      visible: false
    }

    const { mixRefs, mixState, mixMethods } = useList(stateOption)

    // 显示弹框
    const open = () => {
      mixMethods.getList()
      mixState.visible = true
    }

    // 导入按钮操作
    const importTableHandle = async () => {
      try {
        await mixState.importApi(mixState.selectedNodes.map((n) => n.tableName))
      } catch (e) {
        console.log(e)
      }
      mixState.visible = false
      emit('generator-imported')
      ElMessage({
        message: '操作成功',
        type: 'success',
        duration: 1500
      })
    }

    // 隐藏弹窗
    const hideDialog = () => {
      mixState.visible = false
      ;(mixRefs.queryForm.value as any).resetFields()
    }

    // 单击行选中
    const clickRow = (row: AnyObject) => {
      ;(mixRefs.table.value as any).toggleRowSelection(row)
    }

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixMethods,
      open,
      importTableHandle,
      hideDialog,
      clickRow
    }
  }
})
</script>
