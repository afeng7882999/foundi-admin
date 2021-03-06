<template>
  <div ref="moduleRoot" :style="docMinHeight" class="page-oauthUser fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <div class="fd-page-toolbar">
        <el-button @click="close()">
          <fd-icon class="is-in-btn" icon="left"></fd-icon>
          返回列表
        </el-button>
        <el-button
          v-show="auth('system:oauthUser:delete')"
          v-waves
          :disabled="selectedNodes.length <= 0"
          plain
          type="danger"
          @click="del()"
        >
          <fd-icon class="is-in-btn" icon="delete"></fd-icon>
          删除
        </el-button>
        <div class="fd-page-toolbar__right">
          <el-button v-show="auth('system:oauthUser:export')" v-waves @click="exportData()">导出数据</el-button>
        </div>
      </div>
    </div>
    <div class="fd-page__table is-bordered">
      <el-table v-loading="loading" :data="data" row-key="id" @selection-change="onSelectionChange">
        <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
        <el-table-column align="center" header-align="center" label="头像" prop="avatar" width="50">
          <template #default="scope">
            <div class="tb-avatar">
              <el-avatar :src="scope.row.avatar" icon="el-icon-user-solid" size="small"></el-avatar>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="账号"
          prop="account"
          width="150"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="昵称"
          prop="nickName"
          width="150"
        ></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="认证类型" prop="oAuthTypeDict" width="100">
          <template #default="scope">
            <span>{{ dictVal(dicts.sysOAuthType, scope.row.oAuthTypeDict) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="关联用户"
          prop="userId"
          width="150"
        ></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="性别" prop="genderDict" width="50">
          <template #default="scope">
            <span>{{ dictVal(dicts.gender, scope.row.genderDict) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
          label="绑定时间"
          prop="createAt"
          width="160"
        ></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="OpenId" prop="openId"></el-table-column>
        <el-table-column align="center" fixed="right" header-align="center" label="操作" width="100">
          <template #default="scope">
            <el-tooltip :show-after="500" content="删除" placement="top">
              <el-button
                v-show="auth('system:oauthUser:delete')"
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
      <el-pagination
        :background="true"
        :current-page="current"
        :page-count="total"
        :page-size="siz"
        :page-sizes="[10, 20, 50, 100, 200]"
        :total="count"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="pageChange"
        @size-change="sizeChange"
      ></el-pagination>
    </div>
    <el-backtop></el-backtop>
    <edit v-if="editShow" ref="editDialog" @refresh-data-list="getList"></edit>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, toRefs } from 'vue'
import useList from '@/crud/hooks/use-list'
import { oauthUserDel, oauthUserDicts, oauthUserExport, oauthUserFields, oauthUserList, oauthUserQuery } from '@b/api/system/oauth-user'
import Edit from './edit.vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/store'
import usePage from '@/crud/hooks/use-page'
import { Message } from '@b/api/system/message'

export default defineComponent({
  name: 'SystemOauthUser',
  components: { Edit },
  setup() {
    const stateOption = {
      idField: oauthUserFields.idField,
      listApi: oauthUserList,
      delApi: oauthUserDel,
      exportApi: oauthUserExport,
      dicts: oauthUserDicts,
      query: oauthUserQuery
    }

    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const { listRefs, listState, listMethods } = useList<Message>(stateOption)

    const { docMinHeight, showPageHeader, auth } = usePage()

    onBeforeMount(() => {
      const { id } = route.params
      if (id) {
        listState.query.userId = id as string
      }
    })

    const close = () => {
      store.dispatch('view/delView', route)
      router.push({ path: '/system/user' })
    }

    return {
      ...listRefs,
      ...toRefs(listState),
      docMinHeight,
      showPageHeader,
      auth,
      ...listMethods,
      close
    }
  }
})
</script>
