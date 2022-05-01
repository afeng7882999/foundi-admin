<template>
  <fd-page v-bind="pageMainAttrs" name="system-user">
    <template #query>
      <fd-item label="账号" prop="account" placeholder="用户名、手机号、邮箱" width="auto" />
      <fd-item-list label="角色" prop="roleId" :list="s.roleTree" multi />
      <fd-item-tree label="用户组" prop="groupId" :list="s.groupTree" multi />
      <fd-item-dict label="状态" prop="statusDict" :dict="s.dicts.sysUserStatus" />
    </template>
    <template #act>
      <fd-page-toolbar create="system:user:add" del="system:user:delete" export="system:user:export" v-bind="pageToolbarAttrs">
        <template #query>
          <fd-item prop="account" placeholder="用户名、手机号、邮箱" width="150" />
        </template>
      </fd-page-toolbar>
    </template>
    <template #table>
      <el-table ref="table" v-loading="s.loading" v-bind="tableAttrs">
        <fd-col-selection />
        <fd-col-custom>
          <template #default="scope">
            <div class="tb-avatar">
              <el-avatar :src="getFullUrl(scope.row.avatar)" icon="el-icon-user-solid" size="small"></el-avatar>
            </div>
          </template>
        </fd-col-custom>
        <fd-col label="用户名" prop="username" width="150" />
        <fd-col-custom label="角色" prop="roleIdList" multi width="100">
          <template #default="scope">
            <el-tag v-for="item in getRoleNameList(scope.row.roleIdList)" :key="item" :menu-item="item" class="role-tag" size="small">
              {{ item }}
            </el-tag>
          </template>
        </fd-col-custom>
        <fd-col label="手机号" prop="mobile" width="110" />
        <fd-col label="邮箱" prop="email" width="200" />
        <fd-col-custom label="用户组" prop="groupId" width="150">
          <template #default="scope">
            {{ getGroupName(scope.row.groupId) }}
          </template>
        </fd-col-custom>
        <fd-col-dict
          :dict="s.dicts.sysUserStatus"
          label="状态"
          prop="statusDict"
          width="70"
          tag
          :mapping="['正常,success', '禁用,danger']"
        />
        <fd-col-datetime label="注册时间" prop="createAt" width="160" />
        <fd-col label="姓名" prop="name" width="120" />
        <fd-col-dict label="性别" prop="genderDict" width="50" :dict="s.dicts.gender" />
        <fd-col label="出生日期" prop="birthday" width="100" />
        <fd-col-custom label="所在地市" width="200">
          <template #default="scope">
            {{ getDistricts(scope.row) }}
          </template>
        </fd-col-custom>
        <fd-col-act
          detail="system:user:list"
          del="system:user:delete"
          edit="system:user:edit"
          header-align="center"
          width="200"
          @detail="m.showDetail"
          @del="m.del"
        >
          <template #prefix="scope">
            <el-tooltip :content="`显示用户 &quot;${scope.row.username}&quot; 绑定的OAuth2账号`" :show-after="500" placement="top">
              <el-button
                v-show="auth('system:user:edit')"
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
          </template>
        </fd-col-act>
      </el-table>
      <el-pagination v-bind="paginationAttrs"></el-pagination>
    </template>
  </fd-page>
  <detail v-if="s.detailShow" ref="detailDialog" v-bind="detailAttrs" />
  <edit v-if="s.editShow" ref="editDialog" @refresh-data-list="m.getList" />
</template>

<script lang="ts">
export default {
  name: 'SystemUser'
}
</script>

<script setup lang="ts">
import useList from '@/crud/hooks/use-list'
import Edit from './edit.vue'
import Detail from './detail.vue'
import { User, userDel, userDicts, userExport, userList, userQuery } from '@/api/system/user'
import { groupList, Group } from '@/api/system/group'
import { arrayToTree } from '@/utils/data-tree'
import { Role, roleList } from '@/api/system/role'
import { localOrRemoteUrl } from '@/utils/query'
import { useRouter } from 'vue-router'
import usePage from '@/crud/hooks/use-page'
import FdColDatetime from '@/components/table/column/col-datetime.vue'
import FdColCustom from '@/components/table/column/col-custom.vue'

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

const { listRefs, listState: s, listMethods: m, listAttrs } = useList<User>(stateOption)
const { table, detailDialog, editDialog } = listRefs
const { pageMainAttrs, tableAttrs, paginationAttrs, detailAttrs, pageToolbarAttrs } = listAttrs

const { auth, setViewTitle } = usePage()

m.onBeforeGetList(async () => {
  s.groupList = (await groupList()).data
  s.roleList = (await roleList()).data
  s.groupTree = arrayToTree(s.groupList)
  s.roleTree = arrayToTree(s.roleList)
  return true
})

const getGroupName = (id: string) => {
  const group = s.groupList.find((g: Group) => g.id === id)
  return group ? (group as Group).name : '无'
}

const onTableRowClick = (row: User) => {
  setCurrentData(row)
}

m.onAfterGetList(async () => {
  if (s.currentId) {
    const current = s.data.find((d) => d.id === s.currentId) as User
    await setCurrentData(current)
  }
})

const setCurrentData = async (user: User) => {
  if (!user) {
    s.currentId = ''
    detailDialog.value.close()
    return
  }
  s.currentId = user.id
  detailDialog.value.open([user], 0, {
    dicts: s.dicts,
    groupList: s.groupList,
    roleList: s.roleList
  })
}

const getFullUrl = (path: string) => {
  return localOrRemoteUrl(path, 'upload')
}

const getRoleNameList = (ids: string[]) => {
  if (ids) {
    const roles = s.roleList.filter((r: Role) => ids.some((i) => i === r.id))
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
