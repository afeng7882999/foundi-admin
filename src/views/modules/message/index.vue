<template>
  <div :style="docMinHeight" class="page-message">
    <!-- 头部 -->
    <el-form :inline="true">
      <el-form-item>
        <el-button v-waves type="primary" @click="setAllReadHandle()">全部标记已读</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table v-loading="loading" :data="data" :row-class-name="rowClass" style="width: 100%" @selection-change="onSelectionChange">
      <el-table-column align="center" header-align="center" width="30">
        <template #default="scope">
          <fd-icon :icon="unread(scope.row) ? 'email2' : 'email-open'"></fd-icon>
        </template>
      </el-table-column>
      <el-table-column align="center" width="60">
        <template #default="scope">
          <el-tag :type="unread(scope.row) ? 'danger' : 'info'" effect="dark" size="mini">
            {{ unread(scope.row) ? '未读' : '已读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" header-align="center" label="类型" prop="typeDict" width="80">
        <template #default="scope">
          <span>{{ dictVal(dicts.sysMessageType, scope.row.typeDict) }}</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" align="left" header-align="center" label="标题" prop="title" width="300">
        <template #default="scope">
          <span class="title-link" @click="showEdit(scope.row)">{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" align="left" header-align="center" label="内容" prop="content"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" align="left" header-align="center" label="发送时间" prop="createAt" width="160"></el-table-column>
      <el-table-column align="center" fixed="right" header-align="center" label="删除" width="50">
        <template #default="scope">
          <el-tooltip :show-after="500" class="item" content="删除" effect="dark" placement="top">
            <el-button class="fd-tb-act" plain size="mini" type="danger" @click="del(scope.row)">
              <fd-icon icon="close"></fd-icon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination :background="true" :current-page="current" :page-count="total" :page-size="size" :page-sizes="[10, 20, 50, 100]" :total="count" layout="total, sizes, prev, pager, next, jumper" @current-change="pageChange" @size-change="sizeChange"></el-pagination>
    <!-- 添加删除 -->
    <system-message-content-dialog v-if="editShow" ref="editDialog" @refresh-data-list="getList"></system-message-content-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useList from '@/components/crud/use-list'
import SystemMessageContentDialog from './message-content.vue'
import { ElMessage } from 'element-plus'
import { AnyObject } from '@/utils'
import { DelMessageOfCurrent, listMessageOfCurrent, SetMessageReadOfCurrent, userMessageDicts, userMessageQuery } from '@/api/system/message'

export default defineComponent({
  name: 'SystemMessage',
  components: {
    SystemMessageContentDialog
  },
  setup() {
    const stateOption = {
      listApi: listMessageOfCurrent,
      delApi: DelMessageOfCurrent,
      statApi: SetMessageReadOfCurrent,
      dicts: userMessageDicts,
      query: userMessageQuery
    }

    const { mixRefs, mixState, mixComputed, mixMethods } = useList<typeof stateOption>(stateOption)

    const setAllReadHandle = async () => {
      let ids = mixState.data.filter((m) => unread(m)).map((m) => m.id)
      try {
        await mixState.statApi(ids)
        ElMessage({
          message: '操作成功',
          type: 'success',
          duration: 1500,
          onClose: async () => {
            await mixMethods.getList()
          }
        })
      } catch (e) {
        console.log(e)
      }
    }

    const rowClass = ({ row }: AnyObject) => {
      if (!unread(row)) {
        return 'read-message'
      }
    }

    const unread = (message: AnyObject) => {
      return message.stat == null || message.stat === '0'
    }

    return {
      ...mixRefs,
      ...mixComputed,
      ...toRefs(mixState),
      ...mixMethods,
      setAllReadHandle,
      rowClass,
      unread
    }
  }
})
</script>

<style lang="scss" scoped>
@use 'src/assets/style/variable' as *;

.el-table ::v-deep(tr) {
  .title-link {
    cursor: pointer;
    color: var(--el-color-primary);

    &:hover {
      text-decoration: underline;
    }
  }

  &.read-message {
    color: var(--el-color-info);

    .title-link {
      cursor: pointer;
      color: var(--el-color-info);

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
