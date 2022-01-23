<template>
  <div ref="pageRoot" :style="docMinHeight" class="page-message fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <el-form ref="queryForm" :inline="true" :model="query" size="medium" @keyup.enter="queryList()">
        <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
          <div v-show="queryFormShow" class="fd-page__query">
            <el-form-item label="标题" prop="title">
              <el-input v-model="query.title" clearable placeholder="请输入标题" />
            </el-form-item>
            <el-form-item label="信息类型" prop="typeDict">
              <fd-tree-select v-model="query.typeDict" :data-list="dicts.sysMessageType" :select-params="{ multiple: true, placeholder: '请选择信息类型' }" :tree-fields="{ idField: 'itemKey', labelField: 'itemValue' }"></fd-tree-select>
            </el-form-item>
            <el-form-item label="发送时间" prop="createAt">
              <el-date-picker v-model="query.createAt" :default-time="[new Date('0 0:0:0'), new Date('0 23:59:59')]" end-placeholder="结束日期" format="YYYY-MM-DD" range-separator="-" start-placeholder="开始日期" type="daterange"></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button plain type="primary" @click="queryList">
                <fd-icon class="is-in-btn" icon="search"></fd-icon>
                查询
              </el-button>
              <el-button @click="resetQuery">
                清空
              </el-button>
            </el-form-item>
          </div>
        </transition>
      </el-form>
      <div class="fd-page__action">
        <el-button v-show="hasAuth('system:message:delete')" :disabled="selectedNodes.length <= 0" plain type="danger" @click="del()">
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          删除
        </el-button>
        <div class="action-right">
          <el-button v-show="hasAuth('system:message:add')" v-waves type="primary" @click="showEdit()">新增</el-button>
          <el-button v-show="hasAuth('system:message:export')" v-waves @click="exportData()">导出数据</el-button>
          <el-divider class="action-divider" direction="vertical"></el-divider>
          <el-tooltip :content="queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
            <fd-icon-button :class="queryFormShow ? 'expanded' : ''" class="action-query-toggle" icon="double-down" @click="toggleQueryForm()"></fd-icon-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="fd-page__table is-bordered">
      <el-table v-loading="loading" :data="data" row-key="id" @selection-change="onSelectionChange">
        <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="标题" prop="title"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="信息内容" prop="content"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="信息类型" prop="typeDict">
          <template #default="scope">
            <span>{{ dictVal(dicts.sysMessageType, scope.row.typeDict) }}</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="发送方" prop="senderId"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="是否群发" prop="isGroup"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="接收组" prop="groupId"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="发送时间" prop="createAt"></el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="100">
          <template #default="scope">
            <el-tooltip :show-after="500" content="编辑" placement="top">
              <el-button v-show="hasAuth('system:message:edit')" class="fd-tb-act" plain size="mini" type="success" @click="showEdit(scope.row.id)">
                <fd-icon icon="write"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="删除" placement="top">
              <el-button v-show="hasAuth('system:message:delete')" class="fd-tb-act" plain size="mini" type="danger" @click="del(scope.row, scope.row.title)">
                <fd-icon icon="close"></fd-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :background="true" :current-page="current" :page-count="total" :page-size="size" :page-sizes="[10, 20, 50, 100]" :total="count" layout="total, sizes, prev, pager, next, jumper" @current-change="pageChange" @size-change="sizeChange"></el-pagination>
    </div>
    <el-backtop></el-backtop>
    <edit v-if="editShow" ref="editDialog" @refresh-data-list="getList"></edit>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useList from '@/components/crud/use-list'
import { messageDel, messageDicts, messageExport, messageFields, messageList, messageQuery } from '@/api/system/message.ts'
import Edit from './edit.vue'
import useExpandTransition from '@/components/transition/use-expand-transition'

export default defineComponent({
  name: 'SystemMessage',
  components: { Edit },
  setup() {
    const stateOption = {
      idField: messageFields.idField,
      listApi: messageList,
      delApi: messageDel,
      exportApi: messageExport,
      dicts: messageDicts,
      query: messageQuery
    }

    const { mixRefs, mixState, mixComputed, mixMethods } = useList(stateOption)

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixComputed,
      ...mixMethods,
      ...useExpandTransition()
    }
  }
})
</script>
