<template>
  <fd-page v-bind="pageMainAttrs" name="generator">
    <template #query>
      <fd-item label="表名称" prop="tableName" />
      <fd-item label="表描述" prop="tableComment" />
      <fd-item-date-range label="创建时间" prop="tableCreateTime" />
    </template>
    <template #act>
      <fd-page-act del="generator:genTable:delete" v-bind="pageActAttrs">
        <template #query>
          <fd-item label="表名称" prop="tableName" no-label />
          <fd-item :visible="false" />
        </template>
        <template v-if="!isMobile" #buttons>
          <el-button v-show="auth('generator:genTable:edit')" v-waves plain type="primary" @click="handleGenerate(null)">
            <fd-icon class="is-in-btn" icon="download" :loading="s.generating['batch']"></fd-icon>
            生成
          </el-button>
          <el-button v-show="auth('generator:genTable:edit')" v-waves plain type="warning" @click="handlePreview">
            <fd-icon class="is-in-btn" icon="preview-open"></fd-icon>
            预览
          </el-button>
          <el-button v-show="auth('generator:genTable:edit')" v-waves plain type="info" @click="openImport">
            <fd-icon class="is-in-btn" icon="upload-one"></fd-icon>
            导入
          </el-button>
        </template>
        <template v-else #menu>
          <fd-contextmenu-item
            v-show="auth('generator:genTable:edit')"
            color="primary"
            icon="download"
            label="生成"
            @click="handleGenerate(null)"
          />
          <fd-contextmenu-item
            v-show="auth('generator:genTable:edit')"
            color="warning"
            icon="preview-open"
            label="预览"
            @click="handlePreview"
          />
          <fd-contextmenu-item v-show="auth('generator:genTable:edit')" color="info" icon="upload-one" label="导入" @click="openImport" />
        </template>
      </fd-page-act>
    </template>
    <template #table>
      <el-table ref="table" v-loading="s.loading" v-bind="tableAttrs">
        <fd-col-selection />
        <fd-col label="表名" prop="tableName" min-width="200" />
        <fd-col label="表描述" prop="tableComment" min-width="200" />
        <fd-col label="实体名" prop="entityName" min-width="200" />
        <fd-col label="包名" prop="pack" min-width="250" />
        <fd-col label="模块名" prop="module" min-width="100" />
        <fd-col-datetime label="创建时间" prop="tableCreateTime" />
        <fd-col-act
          edit="generator:genTable:edit"
          del="generator:genTable:delete"
          header-align="center"
          width="220"
          @edit="handleEdit"
          @del="m.del"
        >
          <template #prefix="scope">
            <el-tooltip :show-after="500" content="生成并下载代码" placement="top">
              <el-button
                v-show="auth('generator:genTable:edit')"
                class="tb-act-btn"
                plain
                size="small"
                type="primary"
                @click="handleGenerate(scope.row)"
              >
                <fd-icon icon="download" :loading="s.generating[scope.row.id]"></fd-icon>
                生成
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="生成并预览代码" placement="top">
              <el-button
                v-show="auth('generator:genTable:edit')"
                class="tb-act-btn"
                plain
                size="small"
                type="warning"
                @click="handlePreview(scope.row)"
              >
                <fd-icon icon="preview-open"></fd-icon>
                预览
              </el-button>
            </el-tooltip>
          </template>
        </fd-col-act>
      </el-table>
    </template>
  </fd-page>
  <generator-import ref="generatorImport" @generator-imported="m.getList"></generator-import>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import useList from '@/extend/crud/use-list'
import { download, GenTable, genTableDel, genTableList, genTableQuery } from '@/api/generator/gen-table'
import GeneratorImport from './import.vue'
import { ElMessage } from 'element-plus'
import usePage from '@/extend/page/use-page'
import { Indexable } from '@/common/types'
import useView from '@/extend/page/use-view'
import useLayoutSize from '@/hooks/use-layout-size'
import FdContextmenuItem from '@/components/contextmenu/item.vue'

defineOptions({
  name: 'Generator'
})

const generatorImport = ref()

const stateOption = {
  listApi: genTableList,
  delApi: genTableDel,
  downloadApi: download,
  query: genTableQuery,
  uniqueId: '',
  generating: {} as Indexable<boolean>
}

const { listRefs, listState: s, listMethods: m, listAttrs } = useList<GenTable>(stateOption)
const { table } = listRefs
const { pageMainAttrs, pageActAttrs, tableAttrs, paginationAttrs } = listAttrs

const { auth } = usePage()

const { gotoView, onRefresh } = useView()

onRefresh(async () => {
  await m.getList()
})

// 生成
const handleGenerate = async (row: GenTable) => {
  const ids = row ? [row.id] : s.selectedNodes.map((n) => n.id)
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
    s.generating[load] = true
    await s.downloadApi(ids, row ? row.tableName : 'code_generated')
    s.generating[load] = false
  } catch (e) {
    s.generating[load] = false
    console.log(e)
  }
}

// 导入
const openImport = () => {
  ;(generatorImport.value as any).open()
}

// 预览
const handlePreview = async (row: GenTable) => {
  const ids = row && row.id ? row.id : s.selectedNodes.map((n) => n.id).join(',')
  const tableName = row && row.id ? row.tableName + ' ' : ''
  if (ids.length === 0) {
    ElMessage({
      message: '请选择要操作的数据表',
      type: 'error',
      duration: 2500
    })
    return
  }
  // path: tools/generator/preview/:ids
  await gotoView('GeneratorPreview', { ids: ids }, `/generator/preview/${ids}`, `${tableName}代码预览`)
}

// 修改
const handleEdit = async (row: GenTable) => {
  if (row) {
    const tableId = row.id
    const tableName = row.tableName
    // path: tools/generator/edit/:id
    await gotoView('GeneratorEdit', { id: tableId }, `/generator/edit/${tableId}`, `${tableName} 修改`)
  }
}

const { isMobile } = useLayoutSize()
</script>
