<template>
  <div ref="moduleRoot" :style="docMinHeight" class="page-menu fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <div class="fd-page__action">
        <el-button
          v-show="hasAuth('system:menu:delete')"
          v-waves
          :disabled="selectedNodes.length <= 0"
          plain

          type="danger"
          @click="del()"
        >
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          删除
        </el-button>
        <div class="action-right">
          <el-button v-show="hasAuth('system:menu:add')" v-waves plain type="primary" @click="showEdit()">新增</el-button>
          <el-button v-show="hasAuth('system:menu:export')" v-waves @click="exportData()">导出数据</el-button>
        </div>
      </div>
    </div>
    <div ref="tableWrapper" class="fd-page__table is-bordered">
      <el-table ref="table" v-loading="loading" v-bind="tableAttrs">
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="菜单名称"
          prop="name"
          width="200"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="菜单URL"
          prop="url"
          width="180"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="菜单跳转"
          prop="redirect"
          width="180"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="页面文件路径"
          prop="pagePath"
          width="180"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="授权"
          prop="perms"
          width="300"
        ></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="类型" prop="typeDict" width="80">
          <template #default="scope">
            <span>{{ dictVal(dicts.sysMenuType, scope.row.typeDict) }}</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="菜单图标" prop="icon" width="80">
          <template #default="scope">
            <fd-icon :icon="scope.row.icon" class="tb-icon"></fd-icon>
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="center"
          header-align="center"
          label="菜单缩写"
          prop="abbr"
          width="80"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="center"
          header-align="center"
          label="排序"
          prop="sort"
          width="80"
        ></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="是否显示" prop="visible" width="80">
          <template #default="scope">
            <fd-icon v-show="scope.row.visible" class="tb-icon is-success" icon="check"></fd-icon>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="注释" prop="remark"></el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="100">
          <template #default="scope">
            <el-tooltip :show-after="500" content="编辑" placement="top">
              <el-button
                v-show="hasAuth('system:menu:edit')"
                class="tb-act-btn"
                plain
                size="small"
                type="success"
                @click="showEdit(scope.row.id)"
              >
                <fd-icon icon="write"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="删除" placement="top">
              <el-button
                v-show="hasAuth('system:menu:delete')"
                class="tb-act-btn"
                plain
                size="small"
                type="danger"
                @click="del(scope.row, scope.row.k)"
              >
                <fd-icon icon="close"></fd-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-backtop></el-backtop>
      <edit v-if="editShow" ref="editDialog" @refresh-data-list="getList"></edit>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import { menuDel, menuDicts, menuExport, menuFields, menuList, menuQuery, menuTreeFields } from '@/api/system/menu'
import Edit from './edit.vue'
import useExpandTransition from '@/components/transition/use-expand-transition'
import { arrayToTree } from '@/utils/data-tree'
import { AnyObject } from '@/utils'
import usePage from '@/components/crud/use-page'
import useList from '@/components/crud/use-list'

export default defineComponent({
  name: 'SystemMenu',
  components: { Edit },
  setup() {
    const stateOption = {
      treeTable: true,
      idField: menuFields.idField,
      treeFields: menuTreeFields,
      listApi: menuList,
      delApi: menuDel,
      exportApi: menuExport,
      dicts: menuDicts,
      query: menuQuery,

      parentList: [] as AnyObject[]
    }

    const { mixRefs, mixState, mixMethods, mixAttrs } = useList(stateOption)

    const { docMinHeight, showPageHeader, hasAuth } = usePage()

    const getParentList = async () => {
      try {
        const { data: pl } = await mixState.listApi()
        mixState.parentList = arrayToTree(pl, mixState.treeFields)
      } catch (e) {
        console.log(e)
      }
    }

    mixMethods.onBeforeGetList(async () => {
      await getParentList()
      return true
    })

    return {
      ...mixRefs,
      ...toRefs(mixState),
      docMinHeight,
      showPageHeader,
      hasAuth,
      ...mixMethods,
      ...mixAttrs,
      ...useExpandTransition(),
      getParentList
    }
  }
})
</script>
