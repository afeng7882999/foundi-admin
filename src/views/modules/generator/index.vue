<template>
  <div :style="pageMinHeight" class="page-generator fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page-form">
      <el-form ref="queryForm" :inline="true" :model="query" size="medium" @keyup.enter="queryList">
        <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
          <div v-show="queryFormShow" class="page-form-query">
            <el-form-item label="表名称" prop="tableName">
              <el-input v-model="query.tableName" clearable placeholder="请输入表名称" />
            </el-form-item>
            <el-form-item label="表描述" prop="tableComment">
              <el-input v-model="query.tableComment" clearable placeholder="请输入表描述" />
            </el-form-item>
            <el-form-item label="创建时间" prop="tableCreateTime">
              <el-date-picker v-model="query.tableCreateTime" :default-time="[new Date('0 0:0:0'), new Date('0 23:59:59')]" end-placeholder="结束日期" format="YYYY-MM-DD" range-separator="-" start-placeholder="开始日期" type="daterange"></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button plain type="primary" @click="queryList">
                <fd-icon class="in-button" icon="search"></fd-icon>
                查询
              </el-button>
              <el-button @click="resetQuery">
                <fd-icon class="in-button" icon="refresh"></fd-icon>
                清空
              </el-button>
            </el-form-item>
          </div>
        </transition>
        <div class="page-form-action">
          <el-button v-show="hasAuth('generator:genTable:delete')" v-waves :disabled="selectedNodes.length <= 0" plain size="medium" type="danger" @click="del()">
            <fd-icon class="in-button" icon="delete"></fd-icon>
            批量删除
          </el-button>
          <div class="right-action">
            <el-button v-show="hasAuth('generator:genTable:edit')" v-waves size="medium" type="primary" @click="handleGenerate">
              <fd-icon class="in-button" icon="download"></fd-icon>
              生成
            </el-button>
            <el-button v-show="hasAuth('generator:genTable:edit')" v-waves size="medium" type="info" @click="openImport">
              <fd-icon class="in-button" icon="upload-one"></fd-icon>
              导入
            </el-button>
            <el-divider class="action-divider" direction="vertical"></el-divider>
            <el-tooltip :content="queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
              <fd-icon-button :class="queryFormShow ? 'expanded' : ''" class="action-toggle-btn" icon="double-down" @click="toggleQueryForm()"></fd-icon-button>
            </el-tooltip>
          </div>
        </div>
      </el-form>
    </div>
    <div class="fd-page-table border">
      <el-table v-loading="loading" :data="data" @selection-change="onSelectionChange">
        <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="表名" prop="tableName" width="200"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="表描述" prop="tableComment" width="200"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="实体名" prop="entityName" width="200"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="包名" prop="pack" width="200"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="模块名" prop="module" width="100"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="创建时间" prop="tableCreateTime"></el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="250">
          <template #default="scope">
            <el-tooltip :show-after="500" content="生成并预览代码" placement="top">
              <el-button v-show="hasAuth('generator:genTable:edit')" class="fd-tb-act fd-tb-act-edit" plain size="mini" type="primary" @click="openPreview(scope.row)">
                <fd-icon icon="preview-open"></fd-icon>
                预览
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="生成并下载代码" placement="top">
              <el-button v-show="hasAuth('generator:genTable:edit')" class="fd-tb-act fd-tb-act-edit" plain size="mini" type="primary" @click="handleGenerate(scope.row)">
                <fd-icon icon="download"></fd-icon>
                生成
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="编辑" placement="top">
              <el-button v-show="hasAuth('generator:genTable:edit')" class="fd-tb-act fd-tb-act-edit" plain size="mini" type="success" @click="handleEdit(scope.row)">
                <fd-icon icon="write"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="删除" placement="top">
              <el-button v-show="hasAuth('generator:genTable:delete')" class="fd-tb-act fd-tb-act-delete" plain size="mini" type="danger" @click="del(scope.row, scope.row.tableName)">
                <fd-icon icon="close"></fd-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :background="true" :current-page="current" :page-count="total" :page-size="size" :page-sizes="[10, 20, 50, 100]" :total="count" layout="total, sizes, prev, pager, next, jumper" @current-change="pageChange" @size-change="sizeChange"></el-pagination>
    </div>
    <generator-import ref="generatorImport" @generator-imported="getList"></generator-import>
    <generator-preview ref="generatorPreview"></generator-preview>
    <el-backtop></el-backtop>
  </div>
</template>

<script lang="ts">
import { defineComponent, onActivated, ref, toRefs } from 'vue'
import useList from '@/components/crud/use-list'
import useExpandTransition from '@/components/transition/use-expand-transition'
import { download, genTableDel, genTableList, genTableQuery } from '@/api/generator/gen-table'
import GeneratorImport from './import.vue'
import GeneratorPreview from './preview.vue'
import { useRoute, useRouter } from 'vue-router'
import { AnyObject } from '@/utils'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'Generator',
  components: {
    GeneratorImport,
    GeneratorPreview
  },
  setup() {
    const generatorImport = ref()
    const generatorPreview = ref()

    const stateOption = {
      listApi: genTableList,
      delApi: genTableDel,
      downloadApi: download,
      query: genTableQuery,
      uniqueId: ''
    }

    const router = useRouter()
    const route = useRoute()

    const { mixRefs, mixState, mixComputed, mixMethods } = useList(stateOption)

    onActivated(() => {
      const time = route.query.t as string
      if (time && time !== mixState.uniqueId) {
        mixState.uniqueId = time
        mixMethods.getList()
      }
    })

    // 生成代码操作
    const handleGenerate = async (row: AnyObject) => {
      const ids = row && row.id ? [row.id] : mixState.selectedNodes.map((n) => n.id)
      if (ids.length === 0) {
        ElMessage({
          message: '请选择要操作的数据表',
          type: 'error',
          duration: 2500
        })
        return
      }
      try {
        await mixState.downloadApi(ids, ids.length === 1 ? row.tableName : 'code_generated')
      } catch (e) {
        console.log(e)
      }
    }

    // 导入表
    const openImport = () => {
      ;(generatorImport.value as any).open()
    }

    // 预览
    const openPreview = (row: AnyObject) => {
      ;(generatorPreview.value as any).open(row.id)
    }

    // 修改按钮操作
    const handleEdit = async (row: AnyObject) => {
      if (row) {
        const tableId = row.id
        const tableName = row.tableName
        // path: tools/generator/edit/:id
        await mixMethods.setViewTitle(`/generator/edit/${tableId}`, `${tableName} 修改`)
        await router.push({ name: 'GeneratorEdit', params: { id: tableId } })
      }
    }

    return {
      ...toRefs(mixState),
      ...mixComputed,
      ...mixRefs,
      ...mixMethods,
      ...useExpandTransition(),
      generatorImport,
      generatorPreview,
      handleGenerate,
      openImport,
      openPreview,
      handleEdit
    }
  }
})
</script>
