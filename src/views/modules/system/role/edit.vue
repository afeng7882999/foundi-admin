<template>
  <el-dialog
    v-model="state.visible"
    :close-on-click-modal="false"
    :title="state.isCreate ? '新增' : '修改'"
    :width="750"
  >
    <el-form
      ref="form"
      :model="state.formData"
      :rules="state.formRule"
      label-width="80px"
      size="medium"
      @keyup.enter="submit"
    >
      <el-tabs v-model="state.tabName" stretch>
        <el-tab-pane label="角色基本信息" name="1">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="state.formData.name" placeholder="请输入角色名称"></el-input>
          </el-form-item>
          <el-form-item label="角色标识" prop="label">
            <el-input v-model="state.formData.label" placeholder="请输入角色标识"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="state.formData.remark"
              :autosize="{ minRows: 5 }"
              placeholder="请输入备注"
              type="textarea"
            ></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane :label="`业务权限（${state.menuSelectedCount}项）`" name="2">
          <el-form-item label="业务权限">
            <div class="fd-tree-panel">
              <div class="fd-tree-panel__action">
                <el-tooltip :show-after="500" content="选择当前项与下级" effect="dark" placement="top">
                  <el-button size="mini" @click="menuTreeSelectAll">
                    <fd-icon class="is-in-btn" icon="check"></fd-icon>
                    全选
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="清空当前项与下级" effect="dark" placement="top">
                  <el-button size="mini" @click="menuTreeClearAll">
                    <fd-icon class="is-in-btn" icon="close"></fd-icon>
                    重置
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="展开所有节点" effect="dark" placement="top">
                  <el-button size="mini" @click="menuTreeExpand">
                    <fd-icon class="is-in-btn" icon="add"></fd-icon>
                    展开
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="收缩所有节点" effect="dark" placement="top">
                  <el-button size="mini" @click="menuTreeCollapse">
                    <fd-icon class="is-in-btn" icon="reduce"></fd-icon>
                    收缩
                  </el-button>
                </el-tooltip>
              </div>
              <el-tree
                ref="menuTree"
                :data="state.menuList"
                :default-checked-keys="state.formData.menuIdList"
                :default-expand-all="state.menuExpandAll"
                :expand-on-click-node="false"
                :highlight-current="true"
                :props="{ label: 'name', children: 'children', value: 'id' }"
                :show-checkbox="true"
                check-strictly
                node-key="id"
                @check="menuTreeChecked"
              ></el-tree>
            </div>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane :label="`数据权限（${state.groupSelectedCount}项）`" name="3">
          <el-form-item label="数据范围" prop="dataScopeDict">
            <el-select v-model="state.formData.dataScopeDict" style="width: 100%">
              <el-option
                v-for="item in state.dicts.sysRoleDataScope"
                :key="item.itemKey"
                :label="item.itemValue"
                :value="item.itemKey"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据权限">
            <div class="fd-tree-panel">
              <div class="fd-tree-panel__action">
                <el-tooltip :show-after="500" content="选择当前项本级与下级" effect="dark" placement="top">
                  <el-button size="mini" @click="groupTreeSelectAll">
                    <fd-icon class="is-in-btn" icon="check"></fd-icon>
                    全选
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="清空当前项本级与下级" effect="dark" placement="top">
                  <el-button size="mini" @click="groupTreeClearAll">
                    <fd-icon class="is-in-btn" icon="close"></fd-icon>
                    重置
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="展开所有节点" effect="dark" placement="top">
                  <el-button size="mini" @click="groupTreeExpand">
                    <fd-icon class="is-in-btn" icon="add"></fd-icon>
                    展开
                  </el-button>
                </el-tooltip>
                <el-tooltip :show-after="500" content="收缩所有节点" effect="dark" placement="top">
                  <el-button size="mini" @click="groupTreeCollapse">
                    <fd-icon class="is-in-btn" icon="reduce"></fd-icon>
                    收缩
                  </el-button>
                </el-tooltip>
              </div>
              <el-tree
                ref="groupTree"
                :data="state.groupList"
                :default-checked-keys="state.formData.groupIdList"
                :default-expand-all="state.groundExpandAll"
                :expand-on-click-node="false"
                :highlight-current="true"
                :props="{ label: 'name', children: 'children', value: 'id' }"
                :show-checkbox="true"
                check-strictly
                node-key="id"
                @check="groupTreeChecked"
              ></el-tree>
            </div>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button size="medium" @click="state.visible = false">取消</el-button>
        <el-button size="medium" type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'SystemRoleEdit'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import useListEdit, { REFRESH_DATA_EVENT } from '@/components/crud/use-list-edit'
import { roleDicts, roleFields, roleGetOne, rolePostOne, rolePutOne } from '@/api/system/role'
import { groupList, IGroup } from '@/api/system/group'
import { IMenu, menuList } from '@/api/system/menu'
import { arrayToTree } from '@/utils/data-tree'
import { useElTree } from '@/utils/element-plus'
import { ElTree } from 'element-plus'

const emit = defineEmits([REFRESH_DATA_EVENT])

const menuTree = ref()
const groupTree = ref()

const stateOption = {
  idField: roleFields.idField,
  getApi: roleGetOne,
  postApi: rolePostOne,
  putApi: rolePutOne,
  dicts: roleDicts,
  groupList: [] as IGroup[],
  menuList: [] as IMenu[],
  resetFormData: {
    id: '',
    name: '',
    label: '',
    remark: '',
    dataScopeDict: '',
    menuIdList: [],
    groupIdList: []
  },
  formRule: {
    name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
  },
  menuSelectedCount: 0,
  groupSelectedCount: 0,
  menuExpandAll: false,
  groundExpandAll: false,
  ifEdited: false,
  tabName: '1'
}

const { mixRefs, mixState: state, mixMethods } = useListEdit(stateOption, emit)
const { form } = mixRefs
const { open, submit, onAfterGetData, onBeforeOpen, onBeforeSubmitData, onAfterClose } = mixMethods

onBeforeOpen(async () => {
  const { data: menus } = await menuList()
  const { data: groups } = await groupList()
  state.menuList = arrayToTree(menus)
  state.groupList = arrayToTree(groups)
  state.tabName = '1'
})

onAfterGetData(async (data) => {
  state.menuSelectedCount = data.menuIdList.length
  state.groupSelectedCount = data.groupIdList.length
})

onBeforeSubmitData(async () => {
  state.formData.menuIdList = (menuTree.value as any).getCheckedKeys()
  state.formData.groupIdList = (groupTree.value as any).getCheckedKeys()
})

const menuTreeChecked = (data: any, checked: { checkedKeys: string[] }) => {
  state.menuSelectedCount = checked.checkedKeys.length
}

const groupTreeChecked = (data: any, checked: { checkedKeys: string[] }) => {
  state.groupSelectedCount = checked.checkedKeys.length
}

const { expandAll, collapseAll, checkCurrentAndDesc, uncheckCurrentAndDesc } = useElTree()

const menuTreeSelectAll = () => {
  state.menuSelectedCount = checkCurrentAndDesc(menuTree.value as typeof ElTree, state.menuList)
}

const menuTreeClearAll = () => {
  state.menuSelectedCount = uncheckCurrentAndDesc(menuTree.value as typeof ElTree, state.menuList)
}

const menuTreeExpand = () => {
  expandAll(menuTree.value as typeof ElTree)
  state.menuExpandAll = true
}

const menuTreeCollapse = () => {
  collapseAll(menuTree.value as typeof ElTree)
  state.menuExpandAll = false
}

const groupTreeSelectAll = () => {
  state.groupSelectedCount = checkCurrentAndDesc(groupTree.value as typeof ElTree, state.groupList)
}

const groupTreeClearAll = () => {
  state.groupSelectedCount = uncheckCurrentAndDesc(groupTree.value as typeof ElTree, state.groupList)
}

const groupTreeExpand = () => {
  expandAll(groupTree.value as typeof ElTree)
  state.groundExpandAll = true
}

const groupTreeCollapse = () => {
  collapseAll(groupTree.value as typeof ElTree)
  state.groundExpandAll = false
}

onAfterClose(async () => {
  ;(menuTree.value as any).setCurrentKey(null)
  ;(groupTree.value as any).setCurrentKey(null)
  state.menuSelectedCount = 0
  state.groupSelectedCount = 0
})

defineExpose({
  open
})
</script>

<style lang="scss" scoped>
.el-tabs {
  ::v-deep(.el-tabs__header) {
    margin: 0 0 30px;
  }
}
</style>
