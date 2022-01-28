<template>
  <div :style="docMinHeight" class="page-generator fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <el-form ref="queryForm" :inline="true" :model="state.query" size="medium" @keyup.enter="queryList">
        <transition
          name="expand"
          @enter="expandEnter"
          @after-enter="expandAfterEnter"
          @before-leave="expandBeforeLeave"
        >
          <div v-show="state.queryFormShow" class="fd-page__query">
            <el-form-item label="表名称" prop="tableName">
              <el-input v-model="state.query.tableName" clearable placeholder="请输入表名称" />
            </el-form-item>
            <el-form-item label="表描述" prop="tableComment">
              <el-input v-model="state.query.tableComment" clearable placeholder="请输入表描述" />
            </el-form-item>
            <el-form-item label="创建时间" prop="tableCreateTime">
              <el-date-picker
                v-model="state.query.tableCreateTime"
                :default-time="[new Date('0 0:0:0'), new Date('0 23:59:59')]"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="x"
                range-separator="-"
                start-placeholder="开始日期"
                type="daterange"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button plain type="primary" @click="queryList">
                <fd-icon class="is-in-btn" icon="search"></fd-icon>
                查询
              </el-button>
              <el-button @click="resetQuery">清空</el-button>
            </el-form-item>
          </div>
        </transition>
        <div class="fd-page__action">
          <el-button
            v-show="hasAuth('generator:genTable:delete')"
            v-waves
            :disabled="state.selectedNodes.length <= 0"
            plain
            size="medium"
            type="danger"
            @click="del()"
          >
            <fd-icon class="is-in-btn" icon="delete"></fd-icon>
            删除
          </el-button>
          <div class="action-right">
            <el-button
              v-show="hasAuth('generator:genTable:edit')"
              v-waves
              plain
              size="medium"
              type="primary"
              @click="handleGenerate(null)"
            >
              <fd-icon class="is-in-btn" icon="download" :loading="state.generating['batch']"></fd-icon>
              生成
            </el-button>
            <el-button
              v-show="hasAuth('generator:genTable:edit')"
              v-waves
              plain
              size="medium"
              type="warning"
              @click="handlePreview"
            >
              <fd-icon class="is-in-btn" icon="preview-open"></fd-icon>
              预览
            </el-button>
            <el-button
              v-show="hasAuth('generator:genTable:edit')"
              v-waves
              plain
              size="medium"
              type="info"
              @click="openImport"
            >
              <fd-icon class="is-in-btn" icon="upload-one"></fd-icon>
              导入
            </el-button>
            <el-divider class="action-divider" direction="vertical"></el-divider>
            <el-tooltip
              :content="state.queryFormShow ? '隐藏查询表单' : '显示查询表单'"
              :show-after="500"
              effect="dark"
              placement="top"
            >
              <el-badge :hidden="state.queryFormShow || !state.queryLen" :value="state.queryLen" class="action-badge">
                <fd-icon-button class="action-query-toggle" icon="search" @click="toggleQueryForm()"></fd-icon-button>
              </el-badge>
            </el-tooltip>
          </div>
        </div>
      </el-form>
    </div>
    <div class="fd-page__table is-bordered">
      <el-table v-loading="state.loading" :data="state.data" @selection-change="onSelectionChange">
        <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="表名"
          prop="tableName"
          width="250"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="表描述"
          prop="tableComment"
          width="250"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="实体名"
          prop="entityName"
          width="200"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="包名"
          prop="pack"
          width="250"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="模块名"
          prop="module"
          width="100"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="创建时间"
          prop="tableCreateTime"
          width="200"
        >
          <template #default="scope">
            {{ formatTimestamp(scope.row.tableCreateTime) }}
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="250">
          <template #default="scope">
            <el-tooltip :show-after="500" content="生成并下载代码" placement="top">
              <el-button
                v-show="hasAuth('generator:genTable:edit')"
                class="fd-tb-act"
                plain
                size="mini"
                type="primary"
                @click="handleGenerate(scope.row)"
              >
                <fd-icon icon="download" :loading="state.generating[scope.row.id]"></fd-icon>
                生成
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="生成并预览代码" placement="top">
              <el-button
                v-show="hasAuth('generator:genTable:edit')"
                class="fd-tb-act"
                plain
                size="mini"
                type="warning"
                @click="handlePreview(scope.row)"
              >
                <fd-icon icon="preview-open"></fd-icon>
                预览
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="编辑" placement="top">
              <el-button
                v-show="hasAuth('generator:genTable:edit')"
                class="fd-tb-act"
                plain
                size="mini"
                type="success"
                @click="handleEdit(scope.row)"
              >
                <fd-icon icon="write"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="删除" placement="top">
              <el-button
                v-show="hasAuth('generator:genTable:delete')"
                class="fd-tb-act"
                plain
                size="mini"
                type="danger"
                @click="del(scope.row, scope.row.tableName)"
              >
                <fd-icon icon="close"></fd-icon>
              </el-button>
            </el-tooltip>
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
      ></el-pagination>
    </div>
    <generator-import ref="generatorImport" @generator-imported="getList"></generator-import>
    <el-backtop></el-backtop>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Generator'
}
</script>

<script setup lang="ts">
import { onActivated, ref } from 'vue'
import useList from '@/components/crud/use-list'
import useExpandTransition from '@/components/transition/use-expand-transition'
import { download, genTableDel, genTableList, genTableQuery } from '@/api/generator/gen-table'
import GeneratorImport from './import.vue'
import { useRoute, useRouter } from 'vue-router'
import { AnyObject } from '@/utils'
import { ElMessage } from 'element-plus'
import { formatTimestamp } from '@/utils/time'
import usePage from '@/components/crud/use-page'

const generatorImport = ref()

const stateOption = {
  listApi: genTableList,
  delApi: genTableDel,
  downloadApi: download,
  query: genTableQuery,
  uniqueId: '',
  generating: {} as Record<string, boolean>
}

const router = useRouter()
const route = useRoute()

const { mixRefs, mixState: state, mixMethods } = useList(stateOption)
const { queryForm } = mixRefs
const { getList, pageChange, sizeChange, queryList, resetQuery, del, onSelectionChange, toggleQueryForm } = mixMethods

const { docMinHeight, showPageHeader, hasAuth, setViewTitle } = usePage()

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()

onActivated(() => {
  const time = route.query.t as string
  if (time && time !== state.uniqueId) {
    state.uniqueId = time
    getList()
  }
})

// 生成
const handleGenerate = async (row: AnyObject) => {
  const ids = row ? [row.id] : state.selectedNodes.map((n) => n.id)
  const load = row ? row.id : 'batch'
  if (ids.length === 0) {
    ElMessage({
      message: '请选择要操作的数据表',
      type: 'error',
      duration: 2500
    })
    return
  }
  try {
    state.generating[load] = true
    await state.downloadApi(ids, ids.length === 1 ? row.tableName : 'code_generated')
    state.generating[load] = false
  } catch (e) {
    state.generating[load] = false
    console.log(e)
  }
}

// 导入
const openImport = () => {
  ;(generatorImport.value as any).open()
}

// 预览
const handlePreview = async (row: AnyObject) => {
  const ids = row && row.id ? row.id : state.selectedNodes.map((n) => n.id).join(',')
  const tableName = row && row.id ? row.tableName + ' ' : ''
  if (ids.length === 0) {
    ElMessage({
      message: '请选择要操作的数据表',
      type: 'error',
      duration: 2500
    })
  }
  // path: tools/generator/preview/:ids
  await setViewTitle(`/generator/preview/${ids}`, `${tableName}代码预览`)
  await router.push({ name: 'GeneratorPreview', params: { ids: ids } })
}

// 修改
const handleEdit = async (row: AnyObject) => {
  if (row) {
    const tableId = row.id
    const tableName = row.tableName
    // path: tools/generator/edit/:id
    await setViewTitle(`/generator/edit/${tableId}`, `${tableName} 修改`)
    await router.push({ name: 'GeneratorEdit', params: { id: tableId } })
  }
}
</script>
