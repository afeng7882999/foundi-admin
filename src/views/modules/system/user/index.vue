<template>
  <div :style="pageMinHeight" class="page-user fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <fd-split-pane :default-pos="400" shrink="left">
      <template #left>
        <div class="fd-page-form">
          <el-form ref="queryForm" :inline="true" :model="query" size="medium" @keyup.enter="queryList()">
            <transition
              name="expand"
              @enter="expandEnter"
              @after-enter="expandAfterEnter"
              @before-leave="expandBeforeLeave"
            >
              <div v-show="queryFormShow" class="page-form-query">
                <el-form-item label="账号" prop="account">
                  <el-input v-model="query.account" clearable placeholder="用户名、手机号、邮箱" />
                </el-form-item>
                <el-form-item label="角色" prop="roleId">
                  <el-select v-model="query.roleId" multiple clearable placeholder="角色">
                    <el-option
                        v-for="item in roleTree"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="用户组" prop="groupId">
                  <fd-tree-select
                    v-model="query.groupId"
                    :data-list="groupTree"
                    :select-params="{ multiple: true, placeholder: '用户组' }"
                    :tree-params="{ 'default-expand-all': true, 'check-strictly': true }"
                  ></fd-tree-select>
                </el-form-item>
                <el-form-item label="状态" prop="statusDict">
                  <el-select v-model="query.statusDict" clearable size="medium">
                    <el-option
                      v-for="item in dicts.sysUserStatus"
                      :key="item.itemKey"
                      :label="item.itemValue"
                      :value="item.itemKey"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button plain type="primary" @click="queryList">
                    <fd-icon class="in-button" icon="search"></fd-icon>
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
            <el-button
              v-show="hasAuth('system:user:delete')"
              v-waves
              :disabled="selectedNodes.length <= 0"
              plain
              size="medium"
              type="danger"
              @click="del()"
            >
              <fd-icon class="in-button" icon="delete"></fd-icon>
              批量删除
            </el-button>
            <div class="right-action">
              <el-button
                v-show="hasAuth('system:user:add')"
                v-waves
                plain
                size="medium"
                type="primary"
                @click="showEdit()"
              >
                新增
              </el-button>
              <el-button v-show="hasAuth('system:user:export')" v-waves size="medium" @click="exportData()">
                导出数据
              </el-button>
              <el-divider class="action-divider" direction="vertical"></el-divider>
              <el-tooltip
                :content="queryFormShow ? '隐藏查询表单' : '显示查询表单'"
                :show-after="500"
                effect="dark"
                placement="top"
              >
                <fd-icon-button
                  :class="queryFormShow ? 'expanded' : ''"
                  class="action-toggle-btn"
                  icon="double-down"
                  @click="toggleQueryForm()"
                ></fd-icon-button>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div class="fd-page-table border">
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
                <div class="fd-tb-avatar">
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
                <el-tag
                  v-for="item in getRoleNameList(scope.row.roleIdList)"
                  :key="item"
                  :menu-item="item"
                  class="role-tag"
                  size="mini"
                >
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
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="用户组"
              prop="groupId"
              width="150"
            >
              <template #default="scope">
                {{ getGroupName(scope.row.groupId) }}
              </template>
            </el-table-column>
            <el-table-column align="left" header-align="left" label="状态" prop="status" width="60">
              <template #default="scope">
                <el-tag v-if="dictVal(dicts.sysUserStatus, scope.row.statusDict) === '正常'" size="mini" type="success">
                  正常
                </el-tag>
                <el-tag v-else size="mini" type="danger">禁用</el-tag>
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
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="性别"
              prop="genderDict"
              width="50"
            >
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
            <el-table-column
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
              label="所在地市"
              width="200"
            >
              <template #default="scope">
                {{ getDistricts(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column align="center" fixed="right" header-align="center" label="操作" width="210">
              <template #default="scope">
                <el-tooltip
                  :content="`显示用户 &quot;${scope.row.username}&quot; 绑定的OAuth2账号`"
                  :show-after="500"
                  placement="top"
                >
                  <el-button
                    v-show="hasAuth('system:user:edit')"
                    class="fd-tb-act fd-tb-act-edit"
                    plain
                    size="mini"
                    type="success"
                    @click="onOpenOAuthList(scope.row)"
                  >
                    <fd-icon icon="user-positioning"></fd-icon>
                    <span class="fd-tb-act-cap">OAuth2账号</span>
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="编辑" placement="top">
                  <el-button
                    v-show="hasAuth('system:user:edit')"
                    class="fd-tb-act fd-tb-act-edit"
                    plain
                    size="mini"
                    type="success"
                    @click="showEdit(scope.row.id)"
                  >
                    <fd-icon icon="write"></fd-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="删除" placement="top">
                  <el-button
                    v-show="hasAuth('system:user:delete')"
                    class="fd-tb-act fd-tb-act-delete"
                    plain
                    size="mini"
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
            :page-size="size"
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
import useExpandTransition from '@/components/transition/use-expand-transition'
import { IUser, userDel, userDicts, userExport, userList, userQuery } from '@/api/system/user'
import { groupList, IGroup } from '@/api/system/group'
import FdSplitPane from '@/components/split-pane/index.vue'
import { arrayToTree } from '@/utils/data-tree'
import { IRole, roleList } from '@/api/system/role'
import { localOrRemoteUrl } from '@/utils/query'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'SystemUser',
  components: { FdSplitPane, Edit, Detail },
  setup() {
    const stateOption = {
      listApi: userList,
      delApi: userDel,
      exportApi: userExport,
      dicts: userDicts,
      query: userQuery,

      groupList: [] as IGroup[],
      roleList: [] as IRole[],
      groupTree: [] as IGroup[],
      roleTree: [] as IRole[],
      groupTreeProps: {
        children: 'children',
        label: 'name'
      },
      currentId: '',

      treeField: { labelField: 'name' }
    }

    const { mixRefs, mixState, mixComputed, mixMethods } = useList(stateOption)

    const test = () => {
      mixState.treeField.labelField = 'id'
    }

    mixMethods.onBeforeGetList(async () => {
      mixState.groupList = (await groupList()).data
      mixState.roleList = (await roleList()).data
      mixState.groupTree = arrayToTree(mixState.groupList)
      mixState.roleTree = arrayToTree(mixState.roleList)
      return true
    })

    const getGroupName = (id: string) => {
      const group = mixState.groupList.find((g) => g.id === id)
      return group ? (group as IGroup).name : '无'
    }

    const onTableRowClick = (row: IUser) => {
      setCurrentData(row)
    }

    mixMethods.onAfterGetList(async () => {
      if (mixState.currentId) {
        const current = mixState.data.find((d) => d.id === mixState.currentId) as IUser
        await setCurrentData(current)
      }
    })

    const setCurrentData = async (user: IUser) => {
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
        const roles = mixState.roleList.filter((r) => ids.some((i) => i === r.id))
        return roles.map((r) => r.name)
      }
      return []
    }

    const ifOAuthEmpty = (user: IUser) => {
      return !(user.hasWeixin || user.hasQQ || user.hasWeibo)
    }

    const getDistricts = (user: IUser) => {
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

    const onOpenOAuthList = async (row: IUser) => {
      if (row) {
        const id = row.id
        const name = row.username
        // path: system/oauthUser/:id
        await mixMethods.setViewTitle(`/system/oauthUser/${id}`, `用户 ${name} OAuth2账号`)
        await router.push({ name: 'SystemOauthUser', params: { id: id } })
      }
    }

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixComputed,
      ...mixMethods,
      ...useExpandTransition(),
      getGroupName,
      onTableRowClick,
      getFullUrl,
      getRoleNameList,
      ifOAuthEmpty,
      getDistricts,
      onOpenOAuthList,
      test
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
