<template>
  <div class="fd-page__form">
    <el-descriptions :column="2" :title="`角色 - ${state.data[state.idx].name}`" border direction="vertical">
      <el-descriptions-item label="名称">
        <span>{{ state.data[state.idx].name }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="标签">
        <span>{{ state.data[state.idx].label }}</span>
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="备注">
        <span>{{ state.data[state.idx].remark }}</span>
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="数据范围">
        <span>{{ dictVal(state.dicts.sysRoleDataScope, state.data[state.idx].dataScopeDict) }}</span>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>业务权限（{{ state.menuSelectedCount }}项）</template>
        <el-tree
          ref="menuTree"
          :data="state.data[state.idx].menuList"
          :default-expand-all="true"
          :highlight-current="true"
          :props="{ label: 'name', children: 'children', value: 'id' }"
          node-key="id"
        ></el-tree>
      </el-descriptions-item>
      <el-descriptions-item class-name="el-descriptions__content-align-top">
        <template #label>数据权限（{{ state.groupSelectedCount }}项）</template>
        <el-tree
          ref="groupTree"
          :data="state.data[state.idx].groupList"
          :default-expand-all="true"
          :highlight-current="true"
          :props="{ label: 'name', children: 'children', value: 'id' }"
          node-key="id"
        ></el-tree>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemRoleDetail'
}
</script>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import useDetail, { DetailStateOption, OPEN_EDIT_EVENT } from '@b/crud/hooks/use-detail'
import { Role, roleFields } from '@b/api/system/role'
import { Menu } from '@b/api/system/menu'
import { Group } from '@b/api/system/group'
import { arrayToTree } from '@b/utils/data-tree'
import { Indexable } from '@b/common/types'

const stateOption: DetailStateOption<Role> = {
  idField: roleFields.idField,
  resetFormData: {
    id: '',
    name: '',
    label: '',
    remark: '',
    dataScopeDict: '',
    menuList: [] as Menu[],
    groupList: [] as Group[]
  },
  menuSelectedCount: 0,
  groupSelectedCount: 0
}

const emit = defineEmits([OPEN_EDIT_EVENT])

const { detailState: state, detailMethods } = useDetail<Role>(stateOption, emit)
const { onBeforeOpen, resetForm, open, dictVal, close } = detailMethods

onBeforeMount(async () => {
  resetForm()
})

onBeforeOpen(async (data: Role[], idx: number, extra?: Indexable) => {
  if (!extra || !extra.menuList || !extra.groupList) {
    return
  }
  const role = data[idx] as Role
  if (!role.menuList) {
    const allMenu = extra.menuList as Menu[]
    role.menuList = arrayToTree(allMenu.filter((m) => role.menuIdList.includes(m.id)))
  }
  if (!role.groupList) {
    const allGroup = extra.groupList as Group[]
    role.groupList = arrayToTree(allGroup.filter((g) => role.groupIdList.includes(g.id)))
  }
  state.menuSelectedCount = role.menuIdList.length
  state.groupSelectedCount = role.groupIdList.length
})

defineExpose({
  open,
  close
})
</script>
