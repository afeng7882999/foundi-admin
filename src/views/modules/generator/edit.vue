<template>
  <div ref="pageRoot" :style="docMinHeight" class="page-generator-edit fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <div class="fd-page__action">
        <el-button size="medium" @click="close()">
          <fd-icon class="is-in-btn" icon="left"></fd-icon>
          返回列表
        </el-button>
        <el-button plain size="medium" type="warning" @click="handleSyncFromDb()">
          <fd-icon class="is-in-btn" icon="refresh"></fd-icon>
          与数据库同步
        </el-button>
        <div class="action-right">
          <el-button size="medium" type="primary" @click="submitForm()">提交</el-button>
          <el-button size="medium" @click="close()">取消</el-button>
        </div>
      </div>
    </div>

    <el-form ref="form" :model="state.data.table" :rules="state.rules" label-width="150px" size="medium">
      <div class="fd-page__form">
        <div class="fd-page__sub-title"><span class="title-text">基本信息</span></div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="表名称" prop="tableName">
              <el-input v-model="state.data.table.tableName" placeholder="请输入表名称" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="表描述" prop="tableComment">
              <el-input v-model="state.data.table.tableComment" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="实体类名称" prop="entityName">
              <el-input v-model="state.data.table.entityName" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input v-model="state.data.table.author" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="fd-page__form">
        <div class="fd-page__sub-title"><span class="title-text">生成信息</span></div>
        <el-row>
          <el-col :span="24">
            <el-form-item label="表类型">
              <el-checkbox v-model="state.data.table.isTree">树表（增删改查）</el-checkbox>
              <el-checkbox v-model="state.data.table.isSub">子表（仅生成DAO层）</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="pack">
              <template #label>
                <span>
                  生成包路径
                  <el-tooltip content="生成在哪个java包下，例如 net.foundi.admin" placement="top">
                    <fd-icon icon="help" class="is-tip"></fd-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="state.data.table.pack" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="module">
              <template #label>
                <span>
                  生成模块名
                  <el-tooltip content="可理解为子系统名，例如system" placement="top">
                    <fd-icon icon="help" class="is-tip"></fd-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="state.data.table.module" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-show="!state.data.table.isSub">
          <el-col :span="12">
            <el-form-item prop="menuTitle">
              <template #label>
                <span>
                  菜单名
                  <el-tooltip content="前端菜单名称" placement="top">
                    <fd-icon icon="help" class="is-tip"></fd-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="state.data.table.menuTitle" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span>
                  上级菜单
                  <el-tooltip content="分配到指定菜单下，例如系统管理" placement="top">
                    <fd-icon icon="help" class="is-tip"></fd-icon>
                  </el-tooltip>
                </span>
              </template>
              <fd-tree-select
                v-model="state.data.table.menuParentId"
                :data-list="parentMenuList"
                :select-params="{ placeholder: '请选择上级菜单' }"
              ></fd-tree-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-show="state.data.table.isTree">
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span>
                  树编码字段
                  <el-tooltip content="树显示的编码字段名，如：dept_id" placement="top">
                    <fd-icon icon="help" class="is-tip"></fd-icon>
                  </el-tooltip>
                </span>
              </template>
              <fd-tree-select
                v-model="state.data.table.treeId"
                :data-list="fieldNames"
                :select-params="{ placeholder: '请选择' }"
              ></fd-tree-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span>
                  树父编码字段
                  <el-tooltip content="树显示的父编码字段名，如：parent_Id" placement="top">
                    <fd-icon icon="help" class="is-tip"></fd-icon>
                  </el-tooltip>
                </span>
              </template>
              <fd-tree-select
                v-model="state.data.table.treeParentId"
                :data-list="fieldNames"
                :select-params="{ placeholder: '请选择' }"
              ></fd-tree-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span>
                  树名称字段
                  <el-tooltip content="树节点的显示名称字段名，如：dept_name" placement="top">
                    <fd-icon icon="help" class="is-tip"></fd-icon>
                  </el-tooltip>
                </span>
              </template>
              <fd-tree-select
                v-model="state.data.table.treeName"
                :data-list="fieldNames"
                :select-params="{ placeholder: '请选择' }"
              ></fd-tree-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="前端页面">
              <el-checkbox v-model="state.data.table.isFrontEdit">前端生成编辑（新增）页面</el-checkbox>
              <el-checkbox v-model="state.data.table.isFrontDetail">前端生成详细页面</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <div ref="tableWrapper" class="fd-page__table is-bordered">
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
        <el-table-column :show-overflow-tooltip="true" label="字段列名" min-width="10%" prop="columnName" />
        <el-table-column label="字段描述" min-width="10%">
          <template #default="scope">
            <el-input v-model="scope.row.columnComment" size="medium"></el-input>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" label="SQL类型" min-width="10%" prop="columnType" />
        <el-table-column :show-overflow-tooltip="true" label="Java类型" min-width="11%" prop="fieldType" />
        <el-table-column label="字段名称" min-width="10%">
          <template #default="scope">
            <el-input v-model="scope.row.fieldName" size="medium"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="字典类型" min-width="12%">
          <template #default="scope">
            <el-select v-model="scope.row.dictType" clearable filterable placeholder="请选择" size="medium">
              <el-option
                v-for="item in state.dictOptions"
                :key="item.name"
                :label="`${item.nameCn}: ${item.name}`"
                :value="item.name"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="插入" min-width="5%">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isInsert"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="编辑" min-width="5%">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isEdit"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="列表" min-width="5%">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isList"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="查询" min-width="5%">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isQuery"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="排序" min-width="5%">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isOrder"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="必填" min-width="5%">
          <template #default="scope">
            <el-checkbox v-model="scope.row.isRequired"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="查询方式" min-width="10%">
          <template #default="scope">
            <el-select v-model="scope.row.queryType" size="medium">
              <el-option
                v-for="item in DEFAULT_QUERY_TYPES"
                :key="item.value"
                :label="`${item.label}: ${item.value}`"
                :value="item.value"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="显示类型" min-width="12%">
          <template #default="scope">
            <el-select v-model="scope.row.htmlType" size="medium">
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

    <el-backtop></el-backtop>
  </div>
</template>

<script lang="ts">
export default {
  name: 'GeneratorEdit'
}
</script>

<script setup lang="ts">
import { computed, onBeforeMount, reactive, ref } from 'vue'
import usePage from '@/components/crud/use-page'
import { filterTree, ITreeNodeDefault } from '@/utils/data-tree'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { ElForm, ElMessage, ElMessageBox, ElTable } from 'element-plus'
import { AnyObject } from '@/utils'
import { genTableGetOne, genTablePutOne, genTableSyncDb, IGenTable, IGenTableColumn } from '@/api/generator/gen-table'
import { dictList, IDict } from '@/api/system/dict'
import { DEFAULT_HTML_TYPES, DEFAULT_QUERY_TYPES } from '@/views/modules/generator/types'
import useTable from '@/components/table/use-table'

const form = ref<InstanceType<typeof ElForm>>()
const tableWrapper = ref<HTMLElement>()
const table = ref<InstanceType<typeof ElTable>>()

const state = reactive({
  // 表信息
  data: {
    table: {} as IGenTable,
    columns: [] as IGenTableColumn[]
  },
  // 字典信息
  dictOptions: [] as IDict[],
  // 表信息验证规则
  rules: {
    tableName: [{ required: true, message: '请输入表名称', trigger: 'blur' }],
    tableComment: [{ required: true, message: '请输入表描述', trigger: 'blur' }],
    entityName: [{ required: true, message: '请输入实体类名称', trigger: 'blur' }],
    author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
    pack: [{ required: true, message: '请输入生成包路径', trigger: 'blur' }],
    module: [{ required: true, message: '请输入生成模块名', trigger: 'blur' }]
  }
})

const route = useRoute()
const router = useRouter()
const store = useStore<AllState>()
const storeState = store.state as AllState

const { docMinHeight, showPageHeader } = usePage()

const parentMenuList = computed(() => {
  return filterTree(storeState.user.menu as ITreeNodeDefault[], (item) => item.typeDict === '0')
})

const fieldNames = computed(() => {
  return state.data.columns.map((item: AnyObject) => {
    return { id: item.fieldName, name: item.fieldName + ': ' + item.columnComment }
  })
})

onBeforeMount(async () => {
  const { id } = route.params
  if (id) {
    try {
      const { data: dicts } = await dictList()
      state.dictOptions = dicts
      state.data = await genTableGetOne(id as string)
      state.data.columns = state.data.columns.sort((a, b) => a.sort - b.sort)
    } catch (e) {
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
const close = () => {
  store.dispatch('view/delView', route)
  router.push({ path: '/generator', query: { t: Date.now() } })
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
    const id = state.data.table.id
    await genTableSyncDb(id)
    state.data = await genTableGetOne(id)
    ElMessage({
      message: '同步成功',
      type: 'success',
      duration: 2500
    })
  } catch (e) {
    console.log(e)
  }
}

// table drag to sort
useTable(table, tableWrapper, { data: () => state.data.columns, configurable: false, rowDraggable: true })
</script>
