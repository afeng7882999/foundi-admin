<template>
  <div ref="pageRoot" :style="docMinHeight" class="page-generator-edit fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page-toolbar">
      <div class="fd-page-toolbar__left">
        <el-button @click="close()">
          <fd-icon class="is-in-btn" icon="left"></fd-icon>
          返回列表
        </el-button>
        <el-button plain type="warning" @click="handleSyncFromDb()">
          <fd-icon class="is-in-btn" icon="refresh"></fd-icon>
          与数据库同步
        </el-button>
      </div>
      <div class="fd-page-toolbar__right">
        <el-button type="primary" @click="submitForm()">提交</el-button>
        <el-button @click="close()">取消</el-button>
      </div>
    </div>

    <fd-form ref="form" v-loading="state.loading" :model="state.data.table" :rules="state.rules" label-width="130px">
      <div class="fd-page__form">
        <div class="fd-page__sub-title"><span class="title-text">基本信息</span></div>
        <el-row>
          <el-col v-bind="col2">
            <fd-item label="表名称" prop="tableName" disabled />
          </el-col>
          <el-col v-bind="col2">
            <fd-item label="表描述" prop="tableComment" />
          </el-col>
          <el-col v-bind="col2">
            <fd-item label="实体类名称" prop="entityName" />
          </el-col>
          <el-col v-bind="col2">
            <fd-item label="作者" prop="author" />
          </el-col>
        </el-row>
      </div>

      <div class="fd-page__form">
        <div class="fd-page__sub-title"><span class="title-text">生成信息</span></div>
        <el-row>
          <el-col :span="24">
            <fd-item-custom label="表类型">
              <el-checkbox v-model="state.data.table.isTree">树表（增删改查）</el-checkbox>
              <el-checkbox v-model="state.data.table.isSub">子表（仅生成DAO层）</el-checkbox>
            </fd-item-custom>
          </el-col>
        </el-row>
        <el-row>
          <el-col v-bind="col2">
            <fd-item prop="pack" label="生成包路径" tip="生成在哪个java包下，例如 net.foundi.admin" tip-icon />
          </el-col>
          <el-col v-bind="col2">
            <fd-item prop="module" label="生成模块名" tip="可理解为子系统名，例如system" tip-icon />
          </el-col>
        </el-row>
        <el-row v-show="!state.data.table.isSub">
          <el-col v-bind="col2">
            <fd-item prop="menuTitle" label="菜单名" tip="前端菜单名称" tip-icon />
          </el-col>
          <el-col v-bind="col2">
            <fd-item-tree prop="menuParentId" label="上级菜单" :list="parentMenuList" tip="分配到指定菜单下，例如系统管理" tip-icon />
          </el-col>
        </el-row>
        <el-row v-show="state.data.table.isTree">
          <el-col v-bind="col2">
            <fd-item-tree prop="treeId" label="树编码字段" :list="fieldNames" tip="树显示的编码字段名，如：dept_id" tip-icon />
          </el-col>
          <el-col v-bind="col2">
            <fd-item-tree prop="treeParentId" label="树父编码字段" :list="fieldNames" tip="树显示的父编码字段名，如：parent_Id" tip-icon />
          </el-col>
          <el-col v-bind="col2">
            <fd-item-tree prop="treeName" label="树名称字段" :list="fieldNames" tip="树节点的显示名称字段名，如：dept_name" tip-icon />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="前端页面">
              <el-checkbox v-model="state.data.table.isFrontEdit">生成编辑（新增）页面</el-checkbox>
              <el-checkbox v-model="state.data.table.isFrontDetail">生成详细页面</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </fd-form>

    <div ref="tableWrapper" v-loading="state.loading" class="fd-page__table is-bordered">
      <div class="fd-page__sub-title"><span class="title-text">字段信息</span></div>
      <el-table ref="table" :data="state.data.columns" row-key="id">
        <el-table-column class-name="sortable-drag" label="" width="38">
          <template #default>
            <el-tooltip content="拖动排序当前行" placement="right">
              <span><fd-icon icon="drag"></fd-icon></span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="序号" prop="sort" width="50" />
        <el-table-column :show-overflow-tooltip="true" label="字段列名" min-width="150" prop="columnName" />
        <el-table-column label="字段描述" min-width="150">
          <template #default="scope">
            <el-input v-model="scope.row.columnComment"></el-input>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" label="SQL类型" min-width="100" prop="columnType" />
        <el-table-column :show-overflow-tooltip="true" label="Java类型" min-width="100" prop="fieldType" />
        <el-table-column label="字段名称" min-width="150">
          <template #default="scope">
            <el-input v-model="scope.row.fieldName"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="字典类型" min-width="150">
          <template #default="scope">
            <el-select v-model="scope.row.dictType" clearable filterable placeholder="请选择">
              <el-option
                v-for="item in state.dictOptions"
                :key="item.name"
                :label="`${item.nameCn}: ${item.name}`"
                :value="item.name"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="插入" min-width="50">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isInsert"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="编辑" min-width="50">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isEdit"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="列表" min-width="50">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isList"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="查询" min-width="50">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isQuery"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="排序" min-width="50">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isOrder"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="必填" min-width="50">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isRequired"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="查询方式" min-width="100">
          <template #default="scope">
            <el-select v-model="scope.row.queryType">
              <el-option
                v-for="item in DEFAULT_QUERY_TYPES"
                :key="item.value"
                :label="`${item.label}: ${item.value}`"
                :value="item.value"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="显示类型" min-width="120">
          <template #default="scope">
            <el-select v-model="scope.row.htmlType">
              <el-option
                v-for="item in DEFAULT_HTML_TYPES"
                :key="item.value"
                :label="`${item.label}: ${item.value}`"
                :value="item.value"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <fd-page-footer />
    <el-backtop></el-backtop>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, reactive, ref } from 'vue'
import usePage from '@/crud/hooks/use-page'
import { filterTree, TreeNodeDefault } from '@/utils/data-tree'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { ElForm, ElMessage, ElMessageBox, ElTable } from 'element-plus'
import { genTableGetOne, genTablePutOne, genTableSyncDb, GenTableColumn, GenTable } from '@/api/generator/gen-table'
import { dictList, Dict } from '@/api/system/dict'
import { DEFAULT_HTML_TYPES, DEFAULT_QUERY_TYPES } from '@/views/modules/generator/types'
import useSortableRow from '@/components/table/hooks/use-sortable-row'
import useView from '@/crud/hooks/use-view'

defineOptions({
  name: 'GeneratorEdit'
})

const form = ref<InstanceType<typeof ElForm>>()
const tableWrapper = ref<HTMLElement>()
const table = ref<InstanceType<typeof ElTable>>()

const state = reactive({
  // 表信息
  data: {
    table: {} as GenTable,
    columns: [] as GenTableColumn[]
  },
  // 字典信息
  dictOptions: [] as Dict[],
  // 表信息验证规则
  rules: {
    tableName: [{ required: true, message: '请输入表名称', trigger: 'blur' }],
    tableComment: [{ required: true, message: '请输入表描述', trigger: 'blur' }],
    entityName: [{ required: true, message: '请输入实体类名称', trigger: 'blur' }],
    author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
    pack: [{ required: true, message: '请输入生成包路径', trigger: 'blur' }],
    module: [{ required: true, message: '请输入生成模块名', trigger: 'blur' }]
  },
  loading: false
})

const route = useRoute()
const store = useStore<AllState>()
const storeState = store.state as AllState

const { docMinHeight, showPageHeader, col2 } = usePage()

const parentMenuList = computed(() => {
  return filterTree(storeState.user.menu as TreeNodeDefault[], (item) => item.typeDict === '0')
})

const fieldNames = computed(() => {
  return state.data.columns.map((item: Partial<GenTableColumn>) => {
    return { id: item.fieldName, name: item.fieldName + ': ' + item.columnComment }
  })
})

onBeforeMount(async () => {
  const { id } = route.params
  if (id) {
    try {
      state.loading = true
      const { data: dicts } = await dictList()
      state.dictOptions = dicts
      state.data = await genTableGetOne(id as string)
      state.data.columns = state.data.columns.sort((a, b) => (a.sort as number) - (b.sort as number))
      state.loading = false
    } catch (e) {
      state.loading = false
      console.log(e)
    }
  }
})

// 提交按钮
const submitForm = async () => {
  try {
    await (form.value as any).validate()
    await genTablePutOne(state.data)
    close()
    ElMessage({
      message: '操作成功',
      type: 'success',
      duration: 1500
    })
  } catch (e) {
    console.log(e)
  }
}

// 关闭按钮
const { goBackToView } = useView()
const close = () => {
  goBackToView('/generator')
}

// 同步数据库操作
const handleSyncFromDb = async () => {
  const tableName = state.data.table.tableName
  try {
    await ElMessageBox.confirm('确认要强制同步"' + tableName + '"表结构吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    state.loading = true
    const id = state.data.table.id
    await genTableSyncDb(id)
    state.data = await genTableGetOne(id)
    state.loading = false
    ElMessage({
      message: '同步成功',
      type: 'success',
      duration: 2500
    })
  } catch (e) {
    state.loading = false
    console.log(e)
  }
}

// table drag to sort
useSortableRow(table, { data: () => state.data.columns })
</script>
