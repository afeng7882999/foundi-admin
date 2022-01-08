<template>
  <div ref="moduleRoot" :style="pageMinHeight" class="page-loginLog fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <el-form ref="queryForm" :inline="true" :model="query" size="medium" @keyup.enter="queryList()">
        <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
          <div v-show="queryFormShow" class="fd-page__query">
            <el-form-item label="时间" prop="operTime">
              <el-date-picker v-model="query.operTime" :default-time="[new Date('0 0:0:0'), new Date('0 23:59:59')]" end-placeholder="结束日期" format="YYYY-MM-DD" range-separator="-" start-placeholder="开始日期" type="daterange"></el-date-picker>
            </el-form-item>
            <el-form-item label="登录方式" prop="authcTypeDict">
              <fd-tree-select v-model="query.authcTypeDict" :data-list="dicts.sysAuthcType" :select-params="{ multiple: true, placeholder: '请选择登录方式' }" :tree-fields="{ idField: 'itemKey', labelField: 'itemValue' }"></fd-tree-select>
            </el-form-item>
            <el-form-item label="账号" prop="userName">
              <el-input v-model="query.userName" clearable placeholder="请输入用户账号" />
            </el-form-item>
            <el-form-item label="IP地址" prop="ip">
              <el-input v-model="query.ip" clearable placeholder="请输入登录IP地址" />
            </el-form-item>
            <el-form-item label="状态" prop="statusDict">
              <el-select v-model="query.statusDict" size="medium">
                <el-option v-for="item in dicts.sysLoginLogStatus" :key="item.itemKey" :label="item.itemValue" :value="item.itemKey"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button plain type="primary" @click="queryList">
                <fd-icon class="is-in-btn" icon="search"></fd-icon>
                查询
              </el-button>
              <el-button @click="resetQuery">
                <fd-icon class="is-in-btn" icon="refresh"></fd-icon>
                清空
              </el-button>
            </el-form-item>
          </div>
        </transition>
      </el-form>
      <div class="fd-page__action">
        <el-button v-show="hasAuth('system:loginLog:delete')" v-waves :disabled="selectedNodes.length <= 0" plain size="medium" type="danger" @click="del()">
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          批量删除
        </el-button>
        <div class="action-right">
          <el-button v-show="hasAuth('system:loginLog:export')" v-waves size="medium" @click="exportData()">导出数据</el-button>
          <el-divider class="action-divider" direction="vertical"></el-divider>
          <el-tooltip :content="queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
            <fd-icon-button :class="queryFormShow ? 'expanded' : ''" class="action-toggle-btn" icon="double-down" @click="toggleQueryForm()"></fd-icon-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="fd-page__table border">
      <el-table v-loading="loading" :data="data" row-key="id" @selection-change="onSelectionChange">
        <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="访问时间" prop="operTime" width="200">
          <template #default="scope">
            {{ getDateTime(scope.row.operTime) }}
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="类型" prop="typeDict">
          <template #default="scope">
            <span>{{ dictVal(dicts.sysLoginLogType, scope.row.typeDict) }}</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="登录方式" prop="authcTypeDict">
          <template #default="scope">
            <span>{{ dictVal(dicts.sysAuthcType, scope.row.authcTypeDict) }}</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="用户账号" prop="userName"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="IP地址" prop="ip"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="登录地点" prop="location"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="浏览器" prop="browser"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="操作系统" prop="os"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="登录状态" prop="statusDict">
          <template #default="scope">
            <span>{{ dictVal(dicts.sysLoginLogStatus, scope.row.statusDict) }}</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="提示消息" prop="message"></el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="100">
          <template #default="scope">
            <el-tooltip :show-after="500" content="详细" placement="top">
              <el-button v-show="hasAuth('system:operLog:delete')" class="fd-tb-act fd-tb-act-detail" plain size="mini" type="primary" @click="showDetail(scope.$index)">
                <fd-icon icon="view-grid-detail"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="删除" placement="top">
              <el-button v-show="hasAuth('system:loginLog:delete')" class="fd-tb-act fd-tb-act-delete" plain size="mini" type="danger" @click="del(scope.row, scope.row.k)">
                <fd-icon icon="close"></fd-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :background="true" :current-page="current" :page-count="total" :page-size="size" :page-sizes="[10, 20, 50, 100, 200]" :total="count" layout="total, sizes, prev, pager, next, jumper" @current-change="pageChange" @size-change="sizeChange"></el-pagination>
    </div>
    <el-backtop></el-backtop>
    <detail v-if="detailShow" ref="detailDialog" @open-edit-dialog="showEdit"></detail>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useList from '@/components/crud/use-list'
import { loginLogDel, loginLogDicts, loginLogExport, loginLogFields, loginLogList, loginLogQuery } from '@/api/system/login-log'
import Detail from './detail.vue'
import useExpandTransition from '@/components/transition/use-expand-transition'

export default defineComponent({
  name: 'SystemLoginLog',
  components: { Detail },
  setup() {
    const stateOption = {
      idField: loginLogFields.idField,
      listApi: loginLogList,
      delApi: loginLogDel,
      exportApi: loginLogExport,
      dicts: loginLogDicts,
      query: loginLogQuery
    }

    const { mixRefs, mixState, mixComputed, mixMethods } = useList(stateOption)

    const getDateTime = (timestamp: string) => {
      const date = new Date(Number(timestamp))
      const y = date.getFullYear()
      const m = date.getMonth() + 1
      const d = date.getDate()
      return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + date.toTimeString().substr(0, 8);
    }

    mixMethods.onBeforeGetList(() => {
      if (mixState.query.operTime && mixState.query.operTime.length === 2) {
        const timestamp0 = (mixState.query.operTime[0] as Date).getTime()
        const timestamp1 = (mixState.query.operTime[1] as Date).getTime()
        mixState.query.operTime = [timestamp0, timestamp1]
      }
      return true
    })

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixComputed,
      ...mixMethods,
      ...useExpandTransition(),
      getDateTime
    }
  }
})
</script>
