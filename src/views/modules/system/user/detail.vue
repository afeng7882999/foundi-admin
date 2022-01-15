<template>
  <div class="fd-page__form">
    <el-descriptions
      :column="2"
      :title="`系统用户 - ${data[idx].username}`"
      border
      direction="horizontal"
      size="medium"
    >
      <el-descriptions-item :span="2" label="用户ID">{{ data[idx].id }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="用户名">{{ data[idx].username }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="手机号">{{ data[idx].mobile }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="邮箱">{{ data[idx].email }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="用户组">{{ getGroupName(data[idx].groupId) }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="角色">
        <el-tag
          v-for="item in getRoleNameList(data[idx].roleIdList)"
          :key="item"
          :menu-item="item"
          class="page-user-role-tag"
          size="mini"
        >
          {{ item }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="注册时间">{{ data[idx].createAt }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag v-if="dictVal(dicts?.sysUserStatus, data[idx].statusDict) === '正常'" size="mini" type="success">
          正常
        </el-tag>
        <el-tag v-if="dictVal(dicts?.sysUserStatus, data[idx].statusDict) === '禁用'" size="mini" type="danger">
          禁用
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="绑定信息">
        <div class="fd-detail-list">
          <ul class="fd-detail-list__inner">
            <li v-for="(item, index) in data[idx].oAuthUserList" :key="item.id">
              <span class="fd-detail-list__idx">{{ index + 1 }}</span>
              <span class="fd-detail-list__item">
                <el-avatar :src="item.avatar" icon="el-icon-user-solid" size="small"></el-avatar>
              </span>
              <span class="fd-detail-list__item">
                <el-tag size="mini">{{ dictVal(dicts?.sysOAuthType, item.oAuthTypeDict) }}</el-tag>
              </span>
              <span class="fd-detail-list__item">{{ item.nickName }}</span>
            </li>
          </ul>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="姓名">{{ data[idx].name }}</el-descriptions-item>
      <el-descriptions-item label="性别">{{ dictVal(dicts?.gender, data[idx].genderDict) }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="出生日期">{{ data[idx].birthday }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="所在地市">{{ getDistricts(data[idx]) }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="住址">{{ data[idx].address }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, toRefs } from 'vue'
import useDetail from '@/components/crud/use-detail'
import { IUser } from '@/api/system/user'
import { IGroup } from '@/api/system/group'
import { IRole } from '@/api/system/role'
import { IOAuthUser, oauthUserList } from '@/api/system/oauth-user'
import { AnyObject } from '@/utils'
import { IDictItem } from '@/api/system/dict-item'

export default defineComponent({
  name: 'SystemUserDetail',
  setup(props, { emit }) {
    const stateOption = {
      ifShowNavigation: false,
      ifEditable: false,
      dicts: {
        sysOAuthType: [] as IDictItem[]
      },
      groupList: [] as IGroup[],
      roleList: [] as IRole[],
      resetFormData: {
        id: '',
        username: '',
        mobile: '',
        groupId: '',
        name: '',
        avatar: '',
        statusDict: '0',
        email: '',
        genderDict: '0',
        birthday: '',
        address: '',
        province: '',
        city: '',
        district: '',
        createAt: '',
        oAuthUserList: [] as IOAuthUser[]
      }
    }

    const { mixState, mixComputed, mixMethods } = useDetail(stateOption, emit)

    onBeforeMount(async () => {
      mixMethods.resetForm()
      await mixMethods.getDictData()
    })

    mixMethods.onBeforeOpen(async (data: AnyObject[], idx: number, extra?: AnyObject) => {
      mixState.groupList = extra?.groupList
      mixState.roleList = extra?.roleList

      const user = data[idx] as IUser
      const { data: oAuthUserList } = (await oauthUserList({ userId: user.id })) as AnyObject
      ;(oAuthUserList as IOAuthUser[]).sort((a, b) => a.oAuthTypeDict.localeCompare(b.oAuthTypeDict))
      user.oAuthUserList = oAuthUserList
      mixState.data[idx] = { ...user }
    })

    const getGroupName = (id: string) => {
      const group = mixState.groupList.find((g) => g.id === id)
      return group ? (group as IGroup).name : '无'
    }

    const getRoleNameList = (ids: string[]) => {
      if (ids) {
        const roles = mixState.roleList.filter((r) => ids.some((i) => i === r.id))
        return roles.map((r) => r.name)
      }
      return []
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

    return {
      ...toRefs(mixState),
      ...mixComputed,
      ...mixMethods,
      getGroupName,
      getRoleNameList,
      getDistricts
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
