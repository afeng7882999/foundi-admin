<template>
  <div ref="moduleRoot" :style="pageMinHeight" class="page-dictItem fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page-form">
      <el-form ref="queryForm" :inline="true" :model="query" size="medium" @keyup.enter="queryList()">
        <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
          <div v-show="queryFormShow" class="page-form-query">
            <el-form-item label="字典项键值" prop="itemKey">
              <el-input v-model="query.itemKey" clearable placeholder="请输入字典项键值" />
            </el-form-item>
            <el-form-item label="字典项值" prop="itemValue">
              <el-input v-model="query.itemValue" clearable placeholder="请输入字典项值" />
            </el-form-item>
            <el-form-item>
              <el-button plain type="primary" @click="queryList">
                <fd-icon class="in-button" icon="search" plain></fd-icon>
                查询
              </el-button>
              <el-button @click="resetQuery">
                <fd-icon class="in-button" icon="refresh"></fd-icon>
                清空
              </el-button>
            </el-form-item>
          </div>
        </transition>
      </el-form>
      <div class="page-form-action">
        <el-button size="medium" @click="close()">
          <fd-icon class="in-button" icon="left"></fd-icon>
          返回列表
        </el-button>
        <el-button v-show="hasAuth('system:dictItem:delete')" v-waves :disabled="selectedNodes.length <= 0" plain size="medium" type="danger" @click="del()">
          <fd-icon class="in-button" icon="delete"></fd-icon>
          批量删除
        </el-button>
        <div class="right-action">
          <el-button v-show="hasAuth('system:dictItem:add')" v-waves plain size="medium" type="primary" @click="showDictItemEdit()">新增</el-button>
          <el-button v-show="hasAuth('system:dictItem:export')" size="medium" @click.prevent.stop="openMenu($event)">导出数据</el-button>
          <el-divider class="action-divider" direction="vertical"></el-divider>
          <el-tooltip :content="queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
            <fd-icon-button :class="queryFormShow ? 'expanded' : ''" class="action-toggle-btn" icon="double-down" @click="toggleQueryForm()"></fd-icon-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="fd-page-table border">
      <el-table v-loading="loading" :data="data" row-key="id" @selection-change="onSelectionChange">
        <el-table-column align="left" header-align="left" type="selection" width="40"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="字典项键值" prop="itemKey"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="字典项值" prop="itemValue"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="备注信息" prop="remarks"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="排序" prop="sort"></el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="100">
          <template #default="scope">
            <el-tooltip :show-after="500" content="编辑" placement="top">
              <el-button v-show="hasAuth('system:dictItem:edit')" class="fd-tb-act fd-tb-act-edit" plain size="mini" type="success" @click="showDictItemEdit(scope.row.id)">
                <fd-icon icon="write"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="删除" placement="top">
              <el-button v-show="hasAuth('system:dictItem:delete')" class="fd-tb-act fd-tb-act-delete" plain size="mini" type="danger" @click="del(scope.row)">
                <fd-icon icon="close"></fd-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :background="true" :current-page="current" :page-count="total" :page-size="size" :page-sizes="[10, 20, 50, 100, 200]" :total="count" layout="total, sizes, prev, pager, next, jumper" @current-change="pageChange" @size-change="sizeChange"></el-pagination>
    </div>
    <el-backtop></el-backtop>
    <fd-contextmenu ref="contextMenu" event-type="click">
      <fd-contextmenu-item @click="exportDictItemData()">导出当前数据</fd-contextmenu-item>
      <fd-contextmenu-item @click="exportDictItemData('all')">导出所有数据</fd-contextmenu-item>
    </fd-contextmenu>
    <edit v-if="editShow" ref="editDialog" @refresh-data-list="getList"></edit>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onBeforeMount, ref, toRefs } from 'vue'
import useList from '@/components/crud/use-list'
import { dictItemDel, dictItemExport, dictItemFields, dictItemList, dictItemQuery } from '@/api/system/dict-item.ts'
import Edit from './edit.vue'
import useExpandTransition from '@/components/transition/use-expand-transition'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { dictGetOne } from '@/api/system/dict'

export default defineComponent({
  name: 'SystemDictItem',
  components: { Edit },
  setup() {
    const contextMenu = ref()

    const stateOption = {
      idField: dictItemFields.idField,
      listApi: dictItemList,
      delApi: dictItemDel,
      exportApi: dictItemExport,
      query: dictItemQuery,

      dictName: ''
    }

    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const { mixRefs, mixState, mixComputed, mixMethods } = useList(stateOption)

    onBeforeMount(async () => {
      const { id } = route.params
      if (id) {
        mixState.query.dictId = id as string
        try {
          const data = await dictGetOne(id as string)
          mixState.dictName = data.name
        } catch (e) {
          console.log(e)
        }
      }
    })

    // show create/edit dialog
    const showDictItemEdit = async (id?: string) => {
      mixState.editShow = true
      await nextTick(() => {
        ;(mixRefs.editDialog.value as any).openDictItemEdit(mixState.query.dictId as string, id)
      })
    }

    // export data of dict items
    const exportDictItemData = async (type?: string) => {
      mixState.exportLoading = true
      try {
        if (type && type === 'all') {
          await mixState.exportApi('字典条目数据', {})
        } else {
          await mixState.exportApi(`字典${mixState.dictName}数据`, { dictId: mixState.query.dictId })
        }
        mixState.exportLoading = false
      } catch (e) {
        console.log(e)
        mixState.exportLoading = false
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

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixComputed,
      ...mixMethods,
      ...useExpandTransition(),
      contextMenu,
      showDictItemEdit,
      exportDictItemData,
      openMenu,
      close
    }
  }
})
</script>
