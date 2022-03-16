<template>
  <div :style="docMinHeight" class="page-user fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <fd-split-pane :default-pos="400" shrink="left">
      <template #left>
        <div class="fd-page__form">
          <el-form ref="queryForm" :inline="true" :model="query" @keyup.enter="queryList()">
            <transition name="expand" @enter="expandEnter" @after-enter="expandAfterEnter" @before-leave="expandBeforeLeave">
              <div v-show="queryFormShow" class="fd-page__query">
                <fd-fmi label="账号" prop="account" placeholder="用户名、手机号、邮箱" width="auto" />
                <fd-fmi-list label="角色" prop="roleId" :list="roleTree" multi />
                <fd-fmi-tree label="用户组" prop="groupId" :list="groupTree" multi />
                <fd-fmi-dict label="状态" prop="statusDict" :dict="dicts.sysUserStatus" />
                <fd-fmi-act @query="queryList" @reset="resetQuery" />
              </div>
            </transition>
          </el-form>
          <div class="fd-page-act">
            <el-button
              v-show="hasAuth('system:user:delete')"
              v-waves
              :disabled="selectedNodes.length <= 0"
              plain
              type="danger"
              @click="del()"
            >
              <fd-icon class="is-in-btn" icon="delete"></fd-icon>
              删除
            </el-button>
            <div class="fd-page-act__right">
              <el-button v-show="hasAuth('system:user:add')" v-waves plain type="primary" @click="showEdit()">新增</el-button>
              <el-button v-show="hasAuth('system:user:export')" v-waves @click="exportData()">导出数据</el-button>
              <el-divider class="action-divider" direction="vertical"></el-divider>
              <el-tooltip :content="queryFormShow ? '隐藏查询表单' : '显示查询表单'" :show-after="500" effect="dark" placement="top">
                <fd-icon-button
                  :class="queryFormShow ? 'expanded' : ''"
                  class="action-query-toggle"
                  icon="double-down"
                  @click="toggleQueryForm()"
                ></fd-icon-button>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div class="fd-page__table is-bordered">
          <el-table
            v-loading="loading"
            :data="data"
            highlight-current-row
            row-key="id"
            style="width: 100%"
            @selection-change="onSelectionChange"
            @row-click="onTableRowClick"
          >
            <el-table-column align="center" header-align="center" type="selection" width="40"></el-table-column>
            <el-table-column align="center" header-align="center" label="头像" prop="avatar" width="50">
              <template #default="scope">
                <div class="tb-avatar">
                  <el-avatar :src="getFullUrl(scope.row.avatar)" icon="el-icon-user-solid" size="small"></el-avatar>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="用户名"
              prop="username"
              width="150"
            ></el-table-column>
            <el-table-column align="left" header-align="left" label="角色" prop="roleIdList" width="100">
              <template #default="scope">
                <el-tag v-for="item in getRoleNameList(scope.row.roleIdList)" :key="item" :menu-item="item" class="role-tag" size="small">
                  {{ item }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              :formatter="colEmptyFormatter"
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="手机号"
              prop="mobile"
              width="110"
            ></el-table-column>
            <el-table-column
              :formatter="colEmptyFormatter"
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="邮箱"
              prop="email"
              width="200"
            ></el-table-column>
            <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="用户组" prop="groupId" width="150">
              <template #default="scope">
                {{ getGroupName(scope.row.groupId) }}
              </template>
            </el-table-column>
            <el-table-column align="left" header-align="left" label="状态" prop="status" width="70">
              <template #default="scope">
                <el-tag v-if="dictVal(dicts.sysUserStatus, scope.row.statusDict) === '正常'" size="small" type="success">正常</el-tag>
                <el-tag v-else size="small" type="danger">禁用</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="注册时间"
              prop="createAt"
              width="160"
            ></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="姓名"
              prop="name"
              width="120"
            ></el-table-column>
            <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="性别" prop="genderDict" width="50">
              <template #default="scope">
                {{ dictVal(dicts.gender, scope.row.genderDict) }}
              </template>
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="出生日期"
              prop="birthday"
              width="100"
            ></el-table-column>
            <el-table-column :show-overflow-tooltip="true" align="left" header-align="left" label="所在地市" width="200">
              <template #default="scope">
                {{ getDistricts(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column align="center" fixed="right" header-align="center" label="操作" width="300">
              <template #default="scope">
                <el-tooltip :content="`显示用户 &quot;${scope.row.username}&quot; 绑定的OAuth2账号`" :show-after="500" placement="top">
                  <el-button
                    v-show="hasAuth('system:user:edit')"
                    class="tb-act-btn"
                    plain
                    size="default"
                    type="success"
                    @click="onOpenOAuthList(scope.row)"
                  >
                    <fd-icon icon="user-positioning"></fd-icon>
                    <span class="tb-act-btn__caption">OAuth2账号</span>
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="编辑" placement="top">
                  <el-button
                    v-show="hasAuth('system:user:edit')"
                    class="tb-act-btn"
                    plain
                    size="default"
                    type="success"
                    @click="showEdit(scope.row.id)"
                  >
                    <fd-icon icon="write"></fd-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="删除" placement="top">
                  <el-button
                    v-show="hasAuth('system:user:delete')"
                    class="tb-act-btn"
                    plain
                    size="default"
                    type="danger"
                    @click="del(scope.row, scope.row.username)"
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
            :page-sizes="[10, 20, 50, 100]"
            :total="count"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="pageChange"
            @size-change="sizeChange"
          ></el-pagination>
        </div>
      </template>
      <template #right>
        <detail ref="detailDialog"></detail>
      </template>
    </fd-split-pane>
    <el-backtop></el-backtop>
    <edit v-if="editShow" ref="editDialog" @refresh-data-list="getList"></edit>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useList from '@/components/crud/use-list'
import Edit from './edit.vue'
import Detail from './detail.vue'
import useExpandTransition from '@/hooks/use-expand-transition'
import { User, userDel, userDicts, userExport, userList, userQuery } from '@/api/system/user'
import { groupList, Group } from '@/api/system/group'
import FdSplitPane from '@/components/split-pane/index.vue'
import { arrayToTree } from '@/utils/data-tree'
import { Role, roleList } from '@/api/system/role'
import { localOrRemoteUrl } from '@/utils/query'
import { useRouter } from 'vue-router'
import usePage from '@/components/page/use-page'
import FdFmiDict from '@/components/form/components/item-dict.vue'

export default defineComponent({
  name: 'SystemUser',
  components: { FdFmiDict, FdSplitPane, Edit, Detail },
  setup() {
    const stateOption = {
      listApi: userList,
      delApi: userDel,
      exportApi: userExport,
      dicts: userDicts,
      query: userQuery,

      groupList: [] as Group[],
      roleList: [] as Role[],
      groupTree: [] as Group[],
      roleTree: [] as Role[],
      groupTreeProps: {
        children: 'children',
        label: 'name'
      },
      currentId: '',

      treeField: { labelField: 'name' }
    }

    const { mixRefs, mixState, mixMethods, mixAttrs } = useList<User>(stateOption)

    const { docMinHeight, showPageHeader, hasAuth, setViewTitle } = usePage()

    mixMethods.onBeforeGetList(async () => {
      mixState.groupList = (await groupList()).data
      mixState.roleList = (await roleList()).data
      mixState.groupTree = arrayToTree(mixState.groupList)
      mixState.roleTree = arrayToTree(mixState.roleList)
      return true
    })

    const getGroupName = (id: string) => {
      const group = mixState.groupList.find((g: Group) => g.id === id)
      return group ? (group as Group).name : '无'
    }

    const onTableRowClick = (row: User) => {
      setCurrentData(row)
    }

    mixMethods.onAfterGetList(async () => {
      if (mixState.currentId) {
        const current = mixState.data.find((d) => d.id === mixState.currentId) as User
        await setCurrentData(current)
      }
    })

    const setCurrentData = async (user: User) => {
      if (!user) {
        mixState.currentId = ''
        ;(mixRefs.detailDialog.value as any).close()
        return
      }
      mixState.currentId = user.id
      ;(mixRefs.detailDialog.value as any).open([user], 0, {
        dicts: mixState.dicts,
        groupList: mixState.groupList,
        roleList: mixState.roleList
      })
    }

    const getFullUrl = (path: string) => {
      return localOrRemoteUrl(path, 'upload')
    }

    const getRoleNameList = (ids: string[]) => {
      if (ids) {
        const roles = mixState.roleList.filter((r: Role) => ids.some((i) => i === r.id))
        return roles.map((r: Role) => r.name)
      }
      return []
    }

    const ifOAuthEmpty = (user: User) => {
      return !(user.hasWeixin || user.hasQQ || user.hasWeibo)
    }

    const getDistricts = (user: User) => {
      let result = ''
      if (user.province) {
        result += user.province
      }
      if (user.city) {
        result += ' / ' + user.city
      }
      if (user.district) {
        result += ' / ' + user.district
      }
      return result
    }
    const router = useRouter()

    const onOpenOAuthList = async (row: User) => {
      if (row) {
        const id = row.id
        const name = row.username
        // path: system/oauthUser/:id
        await setViewTitle(`/system/oauthUser/${id}`, `用户 ${name} OAuth2账号`)
        await router.push({ name: 'SystemOauthUser', params: { id: id } })
      }
    }

    return {
      ...mixRefs,
      ...mixAttrs,
      ...toRefs(mixState),
      docMinHeight,
      showPageHeader,
      hasAuth,
      setViewTitle,
      ...mixMethods,
      ...useExpandTransition(),
      getGroupName,
      onTableRowClick,
      getFullUrl,
      getRoleNameList,
      ifOAuthEmpty,
      getDistricts,
      onOpenOAuthList
    }
  }
})
</script>

<style lang="scss" scoped>
.page-user-group-tree {
  height: calc(100% - 15px);
  padding: 24px 15px;
  background-color: var(--el-color-white);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
}

.page-user-bind-icon {
  color: var(--el-text-color-placeholder);

  .bind {
    color: var(--el-color-primary);
  }
}

.page-user-role-tag {
  margin-right: 5px;
}
</style>
