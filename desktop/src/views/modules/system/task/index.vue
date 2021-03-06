<template>
  <div ref="moduleRoot" :style="docMinHeight" class="page-task fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <el-form ref="queryForm" :inline="true" :model="query" @keyup.enter="queryList()">
        <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
          <div v-show="queryFormShow" class="fd-page__query">
            <el-form-item label="任务名" prop="jobName">
              <el-input v-model="query.jobName" clearable placeholder="请输入任务名" />
            </el-form-item>
            <el-form-item label="任务状态" prop="jobStatus">
              <el-select v-model="query.jobStatus" clearable filterable placeholder="请选择">
                <el-option v-for="item in taskStatusDict" :key="item.itemKey" :label="item.itemValue" :value="item.itemKey"></el-option>
              </el-select>
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
      <div class="fd-page-toolbar">
        <el-button v-show="auth('system:task:delete')" v-waves :disabled="selectedNodes.length <= 0" plain type="danger" @click="del()">
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          删除
        </el-button>
        <div class="fd-page-toolbar__right">
          <el-button v-show="auth('system:task:add')" v-waves plain type="primary" @click="showEdit()">新增</el-button>
          <el-button v-show="auth('system:task:export')" v-waves @click="exportData()">导出数据</el-button>
          <el-divider class="action-divider" direction="vertical"></el-divider>
          <el-tooltip :content="queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
            <fd-button
              type="icon"
              :class="queryFormShow ? 'expanded' : ''"
              class="action-query-toggle"
              icon="double-down"
              @click="toggleQueryForm()"
            ></fd-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="fd-page__table is-bordered">
      <el-table v-loading="loading" v-bind="tableAttrs">
        <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="center"
          header-align="center"
          label="任务名"
          prop="jobName"
          width="150px"
        ></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="center" header-align="center" label="分组" prop="jobGroup"></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="center"
          header-align="center"
          label="cron表达式"
          prop="cronExpression"
          width="150px"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="center"
          header-align="center"
          label="是否并发"
          prop="isConcurrent"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="center"
          header-align="center"
          label="类名"
          prop="beanClass"
          width="350px"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="center"
          header-align="center"
          label="方法名"
          prop="methodName"
          width="100px"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="center"
          header-align="center"
          label="描述"
          prop="description"
          width="350px"
        ></el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="启动/停止" width="110">
          <template #default="scope">
            <el-tooltip
              :content="ifStart(scope.row.jobStatus) ? '点击停止' : '点击启动'"
              :show-after="500"
              class="item"
              effect="dark"
              placement="top"
            >
              <el-button
                v-show="auth('system:task:edit')"
                :type="ifStart(scope.row.jobStatus) ? 'success' : 'danger'"
                class="tb-act-btn"
                plain
                @click="onStatusClick(scope.row.id, scope.row.jobStatus)"
              >
                <fd-icon class="is-in-btn" :icon="ifStart(scope.row.jobStatus) ? 'stopwatch' : 'stopwatch-stop'"></fd-icon>
                <span class="tb-act-btn__caption">{{ ifStart(scope.row.jobStatus) ? '已启动' : '已停止' }}</span>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="150">
          <template #default="scope">
            <el-tooltip :show-after="500" class="item" content="立即执行一次" effect="dark" placement="top">
              <el-button
                v-show="auth('system:task:edit')"
                :disabled="!ifStart(scope.row.jobStatus)"
                class="tb-act-btn"
                plain
                size="small"
                type="primary"
                @click="onRunClick(scope.row.id, scope.row.jobName)"
              >
                <fd-icon icon="lightning"></fd-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :show-after="500" content="编辑" placement="top">
              <el-button
                v-show="auth('system:task:edit')"
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
                v-show="auth('system:task:delete')"
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
      <el-pagination v-bind="paginationAttrs"></el-pagination>
    </div>
    <el-backtop></el-backtop>
    <edit v-if="editShow" ref="editDialog" @refresh-data-list="getList"></edit>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useList from '@/crud/hooks/use-list'
import {
  Task,
  TASK_STATUS_DICT,
  taskDel,
  taskExport,
  taskFields,
  taskList,
  taskQuery,
  taskRunNow,
  taskStart,
  taskStop
} from '@b/api/system/task'
import Edit from './edit.vue'
import useExpandTransition from '@b/hooks/use-expand-transition'
import { dictKey } from '@b/utils/dict'
import { ElMessage, ElMessageBox } from 'element-plus'
import usePage from '@/crud/hooks/use-page'

export default defineComponent({
  name: 'SystemTask',
  components: { Edit },
  setup() {
    const stateOption = {
      idField: taskFields.idField,
      listApi: taskList,
      delApi: taskDel,
      exportApi: taskExport,
      query: taskQuery,

      taskStatusDict: TASK_STATUS_DICT
    }

    const { listRefs, listState, listMethods, listAttrs } = useList<Task>(stateOption)

    const { docMinHeight, showPageHeader, auth } = usePage()

    const ifStart = (status: string) => {
      return status === dictKey(listState.taskStatusDict, '运行中')
    }

    const onStatusClick = async (id: string, status: string) => {
      let started = ifStart(status)
      let promptStr = started ? '停止' : '启动'
      try {
        await ElMessageBox.confirm(`是否${promptStr}任务?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        if (started) {
          await taskStop(id)
        } else {
          await taskStart(id)
        }
        ElMessage({
          message: '操作成功',
          type: 'success',
          duration: 1500,
          onClose: async () => {
            await listMethods.getList()
          }
        })
      } catch (e) {
        console.log(e)
      }
    }

    const onRunClick = async (id: string) => {
      try {
        await ElMessageBox.confirm(`是否立即执行一次任务?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await taskRunNow(id)
        ElMessage({
          message: '操作成功',
          type: 'success',
          duration: 1500
        })
      } catch (e) {
        console.log(e)
      }
    }

    return {
      ...listRefs,
      ...listAttrs,
      ...toRefs(listState),
      docMinHeight,
      showPageHeader,
      auth,
      ...listMethods,
      ...useExpandTransition(),
      ifStart,
      onStatusClick,
      onRunClick
    }
  }
})
</script>
