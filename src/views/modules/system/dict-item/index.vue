<template>
  <div ref="moduleRoot" :style="docMinHeight" class="system-page-dictItem fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <el-form ref="queryForm" :inline="true" :model="state.query" @keyup.enter="queryList()">
        <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
          <div v-show="state.queryFormShow" class="fd-page__query">
            <el-form-item label="字典项键值" prop="itemKey">
              <el-input v-model="state.query.itemKey" clearable placeholder="请输入字典项键值" />
            </el-form-item>
            <el-form-item label="字典项值" prop="itemValue">
              <el-input v-model="state.query.itemValue" clearable placeholder="请输入字典项值" />
            </el-form-item>
            <el-form-item>
              <el-button plain type="primary" @click="queryList">
                <fd-icon class="is-in-btn" icon="search" plain></fd-icon>
                查询
              </el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </div>
        </transition>
      </el-form>
      <div class="fd-page__action">
        <el-button @click="close()">
          <fd-icon class="is-in-btn" icon="left"></fd-icon>
          返回列表
        </el-button>
        <el-button
          v-show="hasAuth('system:dictItem:delete')"
          v-waves
          :disabled="state.selectedNodes.length <= 0"
          plain
          type="danger"
          @click="del()"
        >
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          删除
        </el-button>
        <div class="action-right">
          <el-button v-show="hasAuth('system:dictItem:add')" v-waves plain type="primary" @click="showDictItemEdit()">新增</el-button>
          <el-button v-show="hasAuth('system:dictItem:export')" @click.prevent.stop="openMenu($event)">导出数据</el-button>
          <el-divider class="action-divider" direction="vertical"></el-divider>
          <el-tooltip :content="state.queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
            <el-badge :hidden="state.queryFormShow || !state.queryLen" :value="state.queryLen" class="action-badge">
              <fd-icon-button class="action-query-toggle" icon="search" @click="toggleQueryForm()"></fd-icon-button>
            </el-badge>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="fd-page__table is-bordered">
      <el-table v-loading="state.loading" v-bind="tableAttrs">
        <el-table-column align="left" header-align="left" type="selection" width="40"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="字典项键值" prop="itemKey"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="字典项值" prop="itemValue"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="备注信息" prop="remarks"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="排序" prop="sort"></el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="100">
          <template #default="scope">
            <el-tooltip :show-after="500" content="编辑" placement="top">
              <el-button
                v-show="hasAuth('system:dictItem:edit')"
                class="tb-act-btn"
                plain
                size="small"
                type="success"
                @click="showDictItemEdit(scope.row.id)"
              >
                <fd-icon icon="write"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="删除" placement="top">
              <el-button
                v-show="hasAuth('system:dictItem:delete')"
                class="tb-act-btn"
                plain
                size="small"
                type="danger"
                @click="del(scope.row)"
              >
                <fd-icon icon="close"></fd-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-bind="paginationAttrs"></el-pagination>
    </div>
    <el-backtop></el-backtop>
    <fd-contextmenu ref="contextMenu" event-type="click">
      <fd-contextmenu-item @click="exportDictItemData()">导出当前数据</fd-contextmenu-item>
      <fd-contextmenu-item @click="exportDictItemData('all')">导出所有数据</fd-contextmenu-item>
    </fd-contextmenu>
    <edit v-if="state.editShow" ref="editDialog" @refresh-data-list="getList"></edit>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemDictItem'
}
</script>

<script setup lang="ts">
import { nextTick, onBeforeMount, ref } from 'vue'
import useList from '@/components/crud/use-list'
import { DictItem, dictItemDel, dictItemExport, dictItemFields, dictItemList, dictItemParams, dictItemQuery } from '@/api/system/dict-item'
import Edit from './edit.vue'
import useExpandTransition from '@/hooks/use-expand-transition'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { dictGetOne } from '@/api/system/dict'
import usePage from '@/components/page/use-page'

const contextMenu = ref()

const stateOption = {
  idField: dictItemFields.idField,
  listApi: dictItemList,
  delApi: dictItemDel,
  exportApi: dictItemExport,
  query: dictItemQuery,
  params: dictItemParams,

  dictName: ''
}

const route = useRoute()
const router = useRouter()
const store = useStore()

const { mixRefs, mixState: state, mixMethods, mixAttrs } = useList<DictItem>(stateOption)
const { queryForm, editDialog } = mixRefs
const { getList, queryList, resetQuery, del, toggleQueryForm } = mixMethods
const { tableAttrs, paginationAttrs } = mixAttrs

const { docMinHeight, showPageHeader, hasAuth } = usePage()

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()

onBeforeMount(async () => {
  const { id } = route.params
  if (id) {
    state.params.dictId = id as string
    try {
      const data = await dictGetOne(id as string)
      state.dictName = data.name
    } catch (e) {
      console.log(e)
    }
  }
})

// show create/edit dialog
const showDictItemEdit = (id?: string) => {
  state.editShow = true
  nextTick(() => {
    ;(editDialog.value as any).openDictItemEdit(state.params.dictId as string, id)
  })
}

// export data of dict items
const exportDictItemData = async (type?: string) => {
  state.exportLoading = true
  try {
    if (type && type === 'all') {
      state.exportApi && (await state.exportApi('字典条目数据', {}))
    } else {
      state.exportApi && (await state.exportApi(`字典${state.dictName}数据`, { dictId: state.params.dictId }))
    }
    state.exportLoading = false
  } catch (e) {
    console.log(e)
    state.exportLoading = false
  }
}

// open context menu
const openMenu = (e: MouseEvent) => {
  ;(contextMenu.value as any).show(e)
}

// close page
const close = () => {
  store.dispatch('view/delView', route)
  router.push({ path: '/system/dict' })
}
</script>
