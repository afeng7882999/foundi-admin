<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="isCreate ? '新增' : '修改'" :width="750">
    <div class="fd-page">
      <el-form ref="form" :model="formData" :rules="formRule" label-width="80px" size="medium" @keyup.enter="submit">
        <el-tabs model-value="1" stretch>
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
              <div class="el-tree-panel">
                <div class="el-tree-panel__action">
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
              <div class="el-tree-panel">
                <div class="el-tree-panel__action">
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
import { arrayToTree, getDescendants } from '@/utils/data-tree'

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
      ifEdited: false
    }

    const { mixRefs, mixState, mixMethods } = useListEdit(stateOption, emit)

    mixMethods.onBeforeOpen(async () => {
      const { data: menus } = await menuList()
      const { data: groups } = await groupList()
      mixState.menuList = arrayToTree(menus)
      mixState.groupList = arrayToTree(groups)
      mixState.menuSelectedCount = menus.length
      mixState.groupSelectedCount = groups.length
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

    const menuTreeSelectAll = () => {
      const tree = menuTree.value as any
      const current = tree.getCurrentKey()
      const checked = tree.getCheckedKeys()
      if (current) {
        const desc = getDescendants(mixState.menuList, (m) => m.id === current)?.map((m) => m.id)
        tree.setCheckedKeys(checked.concat(desc), true)
      }
    }

    const menuTreeClearAll = () => {
      const tree = menuTree.value as any
      const current = tree.getCurrentKey()
      const checked = tree.getCheckedKeys()
      if (current) {
        const desc = getDescendants(mixState.menuList, (m) => m.id === current)?.map((m) => m.id)
        tree.setCheckedKeys(
          checked.filter((c: string) => !desc?.includes(c)),
          true
        )
      }
    }

    const menuTreeExpand = () => {
      const nodes = (menuTree.value as any).store.nodesMap
      mixState.menuExpandAll = true
      for (const i in nodes) {
        nodes[i].expanded = true
      }
    }

    const menuTreeCollapse = () => {
      const nodes = (menuTree.value as any).store.nodesMap
      mixState.menuExpandAll = false
      for (const i in nodes) {
        nodes[i].expanded = false
      }
    }

    const groupTreeSelectAll = () => {
      const tree = groupTree.value as any
      const current = tree.getCurrentKey()
      const checked = tree.getCheckedKeys()
      if (current) {
        const desc = getDescendants(mixState.groupList, (g) => g.id === current)?.map((g) => g.id)
        tree.setCheckedKeys(checked.concat(desc), true)
      }
    }

    const groupTreeClearAll = () => {
      const tree = groupTree.value as any
      const current = tree.getCurrentKey()
      const checked = tree.getCheckedKeys()
      if (current) {
        const desc = getDescendants(mixState.groupList, (g) => g.id === current)?.map((g) => g.id)
        tree.setCheckedKeys(
          checked.filter((c: string) => !desc?.includes(c)),
          true
        )
      }
    }

    const groupTreeExpand = () => {
      const nodes = (groupTree.value as any).store.nodesMap
      mixState.menuExpandAll = true
      for (const i in nodes) {
        nodes[i].expanded = true
      }
    }

    const groupTreeCollapse = () => {
      const nodes = (groupTree.value as any).store.nodesMap
      mixState.menuExpandAll = false
      for (const i in nodes) {
        nodes[i].expanded = false
      }
    }

    mixMethods.onAfterClose(async () => {
      ;(menuTree.value as any).setCurrentKey(null)
      ;(groupTree.value as any).setCurrentKey(null)
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
@use 'src/assets/style/variable.scss' as *;

.el-tree-panel {
  width: 100%;
  border: 1px solid var(--el-border-color-base);
  border-radius: var(--el-border-radius-base);
  padding: 10px;

  .el-tree-panel__action {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-base);
  }
}
</style>
