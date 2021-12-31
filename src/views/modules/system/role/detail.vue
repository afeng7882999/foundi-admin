<template>
  <div class="fd-page-form">
    <el-descriptions :column="2" :title="`角色 - ${data[idx].name}`" border direction="vertical" size="medium">
      <el-descriptions-item label="名称">
        <span>{{ data[idx].name }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="标签">
        <span>{{ data[idx].label }}</span>
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="备注">
        <span>{{ data[idx].remark }}</span>
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="数据范围">
        <span>{{ dictVal(dicts.sysRoleDataScope, data[idx].dataScopeDict) }}</span>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>业务权限（{{ menuSelectedCount }}项）</template>
        <el-tree ref="menuTree" :data="data[idx].menuList" :default-expand-all="true" :highlight-current="true" :props="{ label: 'name', children: 'children', value: 'id' }" node-key="id"></el-tree>
      </el-descriptions-item>
      <el-descriptions-item class-name="el-descriptions__content-align-top">
        <template #label>数据权限（{{ groupSelectedCount }}项）</template>
        <el-tree ref="groupTree" :data="data[idx].groupList" :default-expand-all="true" :highlight-current="true" :props="{ label: 'name', children: 'children', value: 'id' }" node-key="id"></el-tree>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, toRefs } from 'vue'
import useDetail from '@/components/crud/use-detail'
import { roleFields } from '@/api/system/role'
import { IMenu } from '@/api/system/menu'
import { IGroup } from '@/api/system/group'
import { AnyObject } from '@/utils'
import { arrayToTree } from '@/utils/data-tree'

export default defineComponent({
  name: 'SystemRoleDetail',
  setup(props, { emit }) {
    const stateOption = {
      idField: roleFields.idField,
      resetFormData: {
        id: '',
        name: '',
        label: '',
        remark: '',
        dataScopeDict: '',
        menuList: [] as IMenu[],
        groupList: [] as IGroup[]
      },
      menuSelectedCount: 0,
      groupSelectedCount: 0
    }

    const { mixState, mixComputed, mixMethods } = useDetail(stateOption, emit)

    onBeforeMount(async () => {
      mixMethods.resetForm()
    })

    mixMethods.onBeforeOpen(async (data: AnyObject[], idx: number, extra?: AnyObject) => {
      if (!extra || !extra.menuList || !extra.groupList) {
        return
      }
      const role = data[idx] as AnyObject
      if (!role.menuList) {
        const allMenu = extra.menuList as IMenu[]
        role.menuList = arrayToTree(allMenu.filter((m) => role.menuIdList.includes(m.id)))
      }
      if (!role.groupList) {
        const allGroup = extra.groupList as IGroup[]
        role.groupList = arrayToTree(allGroup.filter((g) => role.groupIdList.includes(g.id)))
      }
      mixState.menuSelectedCount = role.menuIdList.length
      mixState.groupSelectedCount = role.groupIdList.length
    })

    return {
      ...toRefs(mixState),
      ...mixComputed,
      ...mixMethods
    }
  }
})
</script>
