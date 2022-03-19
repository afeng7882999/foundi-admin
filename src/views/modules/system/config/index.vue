<template>
  <div ref="moduleRoot" :style="docMinHeight" class="page-system-config fd-page">
    <!--  系统配置管理 -->
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <el-form ref="queryForm" :inline="true" :model="state.query" @keyup.enter="queryList()">
        <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
          <div v-show="state.queryFormShow" class="fd-page__query">
            <el-form-item label="配置分类" prop="configTypeDict">
              <el-select v-model="state.query.configTypeDict" multiple clearable placeholder="请选择配置分类" style="width: 200px">
                <el-option
                  v-for="item in state.dicts.sysConfigType"
                  :key="item.itemKey"
                  :label="item.itemValue"
                  :value="item.itemKey"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="键" prop="configKey">
              <el-input v-model="state.query.configKey" clearable placeholder="请输入键" style="width: 200px" />
            </el-form-item>
            <el-form-item>
              <el-button plain type="primary" @click="queryList">
                <fd-icon class="is-in-btn" icon="search"></fd-icon>
                查询
              </el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </div>
        </transition>
      </el-form>
      <div class="fd-page-act">
        <el-button
          v-show="hasAuth('system:config:delete')"
          v-waves
          :disabled="state.selectedNodes.length <= 0"
          plain
          type="danger"
          @click="del()"
        >
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          删除
        </el-button>
        <div class="fd-page-act__right">
          <el-button v-show="hasAuth('system:config:add')" v-waves type="primary" plain @click="showEdit()">
            <fd-icon class="is-in-btn" icon="plus"></fd-icon>
            新增
          </el-button>
          <el-button v-show="hasAuth('system:config:export')" v-waves @click="exportData()">导出数据</el-button>
          <el-divider class="action-divider" direction="vertical"></el-divider>
          <el-tooltip :content="state.queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
            <el-badge :hidden="state.queryFormShow || !state.queryLen" :value="state.queryLen" class="action-badge">
              <fd-icon-button class="action-query-toggle" icon="search" @click="toggleQueryForm()"></fd-icon-button>
            </el-badge>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div ref="tableWrapper" class="fd-page__table is-bordered">
      <el-table ref="table" v-loading="state.loading" v-bind="tableAttrs">
        <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="启用" prop="enabled" width="70">
          <template #default="scope">
            <el-tag v-if="scope.row.enabled" size="small" type="success">启用</el-tag>
            <el-tag v-else size="small" type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="配置分类" prop="configTypeDict" width="150">
          <template #default="scope">
            <span>{{ dictVal(state.dicts.sysConfigType, scope.row.configTypeDict) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="键"
          prop="configKey"
          width="150"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="值"
          prop="configValue"
          width="600"
        ></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="备注" prop="remark"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="创建时间" prop="createAt" width="200">
          <template #default="scope">
            <span>{{ formatTimestamp(scope.row.createAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="130">
          <template #default="scope">
            <el-tooltip :show-after="500" content="详细" placement="top">
              <el-button
                v-show="hasAuth('system:config:list')"
                class="tb-act-btn tb-act-btn-detail"
                plain
                size="small"
                type="primary"
                @click="showDetail(scope.$index)"
              >
                <fd-icon icon="view-grid-detail"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="编辑" placement="top">
              <el-button
                v-show="hasAuth('system:config:edit')"
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
                v-show="hasAuth('system:config:delete')"
                class="tb-act-btn"
                plain
                size="small"
                type="danger"
                @click="del(scope.row, scope.row.configKey)"
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
    <detail v-if="state.detailShow" ref="detailDialog" v-bind="detailAttrs" @open-edit-dialog="showEdit(state.currentId)"></detail>
    <edit v-if="state.editShow" ref="editDialog" @refresh-data-list="getList"></edit>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemConfig'
}
</script>

<script setup lang="ts">
import useList from '@/extend/crud/use-list'
import { configDel, configDicts, configExport, configFields, configList, configQuery, Config } from '@/api/system/config'
import Edit from './edit.vue'
import Detail from './detail.vue'
import useExpandTransition from '@/hooks/use-expand-transition'
import { formatTimestamp } from '@/utils/time'
import usePage from '@/extend/page/use-page'

const stateOption = {
  idField: configFields.idField,
  listApi: configList,
  delApi: configDel,
  exportApi: configExport,
  dicts: configDicts,
  query: configQuery,
  currentId: '',
  tableRowSelectable: true
}

const { mixRefs, mixState: state, mixMethods, mixAttrs } = useList<Config>(stateOption)
const { queryForm, table, editDialog, detailDialog } = mixRefs
const { getList, queryList, resetQuery, del, dictVal, exportData, showEdit, showDetail, toggleQueryForm } = mixMethods
const { tableAttrs, paginationAttrs, detailAttrs } = mixAttrs

const { docMinHeight, showPageHeader, hasAuth } = usePage()

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()
</script>
