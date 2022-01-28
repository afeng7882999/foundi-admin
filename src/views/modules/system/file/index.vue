<template>
  <div ref="moduleRoot" :style="docMinHeight" class="page-system-file fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <el-form ref="queryForm" :inline="true" :model="state.query" size="medium" @keyup.enter="queryList()">
        <transition
          name="expand"
          @enter="expandEnter"
          @after-enter="expandAfterEnter"
          @before-leave="expandBeforeLeave"
        >
          <div v-show="state.queryFormShow" class="fd-page__query">
            <el-form-item label="文件名" prop="name">
              <el-input v-model="state.query.name" clearable placeholder="请输入文件名" style="width: 150px" />
            </el-form-item>
            <el-form-item label="OSS" prop="oss">
              <fd-tree-select
                v-model="state.query.oss"
                :data-list="state.configList"
                :select-params="{ placeholder: 'OSS配置' }"
                :tree-fields="{ idField: 'configKey', labelField: 'configKey' }"
                style="width: 200px"
              ></fd-tree-select>
            </el-form-item>
            <el-form-item label="文件类型" prop="typeDict">
              <el-select v-model="state.query.typeDict" size="medium" style="width: 150px">
                <el-option
                  v-for="item in state.dicts.sysFileType"
                  :key="item.itemKey"
                  :label="item.itemValue"
                  :value="item.itemKey"
                ></el-option>
              </el-select>
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
      </el-form>
      <div class="fd-page__action">
        <el-button
          v-show="hasAuth('system:file:delete')"
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
          <el-button v-show="hasAuth('system:file:upload')" v-waves size="medium" type="primary" @click="showEdit()">
            上传文件
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
    </div>
    <div class="fd-page__table is-bordered">
      <el-table v-loading="state.loading" :data="state.data" row-key="id" @selection-change="onSelectionChange">
        <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="文件名"
          prop="name"
          width="450"
        >
          <template #default="scope">
            <el-link :href="localOrRemoteUrl(scope.row.url, 'upload')">{{ scope.row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="OSS配置"
          prop="oss"
          width="200"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="文件类型"
          prop="typeDict"
          width="100"
        >
          <template #default="scope">
            <span>{{ dictVal(state.dicts.sysFileType, scope.row.typeDict) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="创建时间"
          prop="createAt"
          width="200"
        >
          <template #default="scope">
            {{ formatTimestamp(scope.row.createAt) }}
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="创建人ID"
          prop="createBy"
        ></el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="160">
          <template #default="scope">
            <el-tooltip :show-after="500" content="复制当前文件连接" placement="top">
              <el-button
                v-show="hasAuth('system:file:list')"
                class="fd-tb-act"
                plain
                size="mini"
                type="primary"
                @click="copyUrl(scope.row.url, $event)"
              >
                <fd-icon icon="link-one"></fd-icon>
                复制链接
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="删除" placement="top">
              <el-button
                v-show="hasAuth('system:file:delete')"
                class="fd-tb-act tb-act-delete"
                plain
                size="mini"
                type="danger"
                @click="del(scope.row, scope.row.k)"
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
        :page-sizes="[10, 20, 50, 100, 200]"
        :total="state.count"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="pageChange"
        @size-change="sizeChange"
      ></el-pagination>
    </div>
    <el-backtop></el-backtop>
    <upload v-if="state.editShow" ref="editDialog" @refresh-data-list="getList"></upload>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemFile'
}
</script>

<script setup lang="ts">
import useList from '@/components/crud/use-list'
import { fileDel, fileDicts, fileFields, fileList, fileQuery } from '@/api/system/file'
import useExpandTransition from '@/components/transition/use-expand-transition'
import { configListOss, IConfig } from '@/api/system/config'
import Upload from './upload.vue'
import { localOrRemoteUrl } from '@/utils/query'
import handleClipboard from '@/utils/clipboard'
import { formatTimestamp } from '@/utils/time'
import usePage from '@/components/crud/use-page'

const stateOption = {
  idField: fileFields.idField,
  listApi: fileList,
  delApi: fileDel,
  dicts: fileDicts,
  query: fileQuery,
  configList: [] as IConfig[]
}

const { mixRefs, mixState: state, mixMethods } = useList(stateOption)
const { queryForm, editDialog } = mixRefs
const {
  getList,
  queryList,
  resetQuery,
  toggleQueryForm,
  dictVal,
  pageChange,
  sizeChange,
  del,
  onSelectionChange,
  showEdit,
  onBeforeGetList
} = mixMethods

const { docMinHeight, showPageHeader, hasAuth } = usePage()

const { expandEnter, expandAfterEnter, expandBeforeLeave } = useExpandTransition()

onBeforeGetList(async () => {
  state.configList = (await configListOss()).data
  return true
})

const copyUrl = (url: string, event: Event) => {
  handleClipboard(localOrRemoteUrl(url, 'upload'), event)
}
</script>
