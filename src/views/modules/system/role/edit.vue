<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="isCreate ? '新增' : '修改'" :width="750">
    <div class="fd-page">
      <el-form ref="form" :model="formData" :rules="formRule" label-width="80px" size="medium" @keyup.enter="submit">
        <el-tabs v-model="tabName" stretch>
          <el-tab-pane label="角色基本信息" name="1">
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入角色名称"></el-input>
            </el-form-item>
            <el-form-item label="角色标识" prop="label">
              <el-input v-model="formData.label" placeholder="请输入角色标识"></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="formData.remark"
                :autosize="{ minRows: 5 }"
                placeholder="请输入备注"
                type="textarea"
              ></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane :label="`业务权限（${menuSelectedCount}项）`" name="2">
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
                      清空
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
                  :data="menuList"
                  :default-checked-keys="formData.menuIdList"
                  :default-expand-all="menuExpandAll"
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
          <el-tab-pane :label="`数据权限（${groupSelectedCount}项）`" name="3">
            <el-form-item label="数据范围" prop="dataScopeDict">
              <el-select v-model="formData.dataScopeDict" style="width: 100%">
                <el-option
                  v-for="item in dicts.sysRoleDataScope"
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
                      清空
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
                  :data="groupList"
                  :default-checked-keys="formData.groupIdList"
                  :default-expand-all="groundExpandAll"
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
    </div>
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button size="medium" @click="visible = false">取消</el-button>
        <el-button size="medium" type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue'
import useListEdit, { REFRESH_DATA_EVENT } from '@/components/crud/use-list-edit'
import { roleDicts, roleFields, roleGetOne, rolePostOne, rolePutOne } from '@/api/system/role'
import { groupList, IGroup } from '@/api/system/group'
import { IMenu, menuList } from '@/api/system/menu'
import { arrayToTree } from '@/utils/data-tree'
import { useElTree } from '@/utils/element-plus'
import { ElTree } from 'element-plus'

export default defineComponent({
  name: 'SystemRoleEdit',
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
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

    const { mixRefs, mixState, mixMethods } = useListEdit(stateOption, emit)

    mixMethods.onBeforeOpen(async () => {
      const { data: menus } = await menuList()
      const { data: groups } = await groupList()
      mixState.menuList = arrayToTree(menus)
      mixState.groupList = arrayToTree(groups)
      mixState.tabName = '1'
    })

    mixMethods.onAfterGetData(async (data) => {
      mixState.menuSelectedCount = data.menuIdList.length
      mixState.groupSelectedCount = data.groupIdList.length
    })

    mixMethods.onBeforeSubmitData(async () => {
      mixState.formData.menuIdList = (menuTree.value as any).getCheckedKeys()
      mixState.formData.groupIdList = (groupTree.value as any).getCheckedKeys()
    })

    const menuTreeChecked = (data: any, checked: { checkedKeys: string[] }) => {
      mixState.menuSelectedCount = checked.checkedKeys.length
    }

    const groupTreeChecked = (data: any, checked: { checkedKeys: string[] }) => {
      mixState.groupSelectedCount = checked.checkedKeys.length
    }

    const { expandAll, collapseAll, checkCurrentAndDesc, uncheckCurrentAndDesc } = useElTree()

    const menuTreeSelectAll = () => {
      mixState.menuSelectedCount = checkCurrentAndDesc(menuTree.value as typeof ElTree, mixState.menuList)
    }

    const menuTreeClearAll = () => {
      mixState.menuSelectedCount = uncheckCurrentAndDesc(menuTree.value as typeof ElTree, mixState.menuList)
    }

    const menuTreeExpand = () => {
      expandAll(menuTree.value as typeof ElTree)
      mixState.menuExpandAll = true
    }

    const menuTreeCollapse = () => {
      collapseAll(menuTree.value as typeof ElTree)
      mixState.menuExpandAll = false
    }

    const groupTreeSelectAll = () => {
      mixState.groupSelectedCount = checkCurrentAndDesc(groupTree.value as typeof ElTree, mixState.groupList)
    }

    const groupTreeClearAll = () => {
      mixState.groupSelectedCount = uncheckCurrentAndDesc(groupTree.value as typeof ElTree, mixState.groupList)
    }

    const groupTreeExpand = () => {
      expandAll(groupTree.value as typeof ElTree)
      mixState.groundExpandAll = true
    }

    const groupTreeCollapse = () => {
      collapseAll(groupTree.value as typeof ElTree)
      mixState.groundExpandAll = false
    }

    mixMethods.onAfterClose(async () => {
      ;(menuTree.value as any).setCurrentKey(null)
      ;(groupTree.value as any).setCurrentKey(null)
      mixState.menuSelectedCount = 0
      mixState.groupSelectedCount = 0
    })

    return {
      menuTree,
      groupTree,
      ...mixRefs,
      ...toRefs(mixState),
      ...mixMethods,
      menuTreeChecked,
      groupTreeChecked,
      menuTreeSelectAll,
      menuTreeClearAll,
      menuTreeExpand,
      menuTreeCollapse,
      groupTreeSelectAll,
      groupTreeClearAll,
      groupTreeExpand,
      groupTreeCollapse
    }
  }
})
</script>

<style lang="scss" scoped>
.el-tabs {
  ::v-deep(.el-tabs__header) {
    margin: 0 0 30px;
  }
}
</style>

<style lang="scss">
@use 'src/assets/style/variable.scss' as *;

.fd-tree-panel {
  width: 100%;
  border: 1px solid var(--el-border-color-base);
  border-radius: var(--el-border-radius-base);
  padding: 10px;

  &__action {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-base);
  }
}
</style>
