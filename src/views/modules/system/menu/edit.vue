<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="isCreate ? '新增' : '修改'" @closed="hideDialog">
    <el-form ref="form" :model="formData" :rules="formRule" label-width="80px" size="medium" @keyup.enter="submit()">
      <el-form-item label="父菜单" prop="parentId">
        <fd-tree-select v-model="formData.parentId" :data-list="parentList" :tree-fields="{ labelField: 'name' }" style="width: 100%"></fd-tree-select>
      </el-form-item>
      <el-form-item label="菜单名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入菜单名称"></el-input>
      </el-form-item>
      <el-form-item label="菜单URL" prop="url">
        <el-input v-model="formData.url" placeholder="请输入菜单URL"></el-input>
      </el-form-item>
      <el-form-item label="菜单跳转" prop="redirect">
        <el-input v-model="formData.redirect" placeholder="请输入菜单跳转"></el-input>
      </el-form-item>
      <el-form-item label="授权" prop="perms">
        <fd-tag-input v-model="perms"></fd-tag-input>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="类型" prop="typeDict">
            <el-select v-model="formData.typeDict" style="width: 100%">
              <el-option v-for="item in dicts.sysMenuType" :key="item.itemKey" :label="item.itemValue" :value="item.itemKey"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" controls-position="right" style="width: 100%"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="16">
          <el-form-item label="菜单图标" prop="icon">
            <fd-icon-selector v-model="formData.icon" :if-show-filter="true" :if-show-label="true"></fd-icon-selector>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="菜单缩写" prop="abbr">
            <el-input v-model="formData.abbr" placeholder="请输入菜单缩写"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="注释" prop="remark">
        <el-input v-model="formData.remark" :autosize="{ minRows: 2 }" placeholder="请输入注释" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="是否显示" prop="visible">
        <el-switch v-model="formData.visible" active-text="是" inactive-text="否"></el-switch>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button size="medium" @click="visible = false">取消</el-button>
        <el-button size="medium" type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useTreeEdit, { REFRESH_DATA_EVENT } from '@/components/crud/use-tree-edit'
import { menuDicts, menuFields, menuGetOne, menuList, menuPostOne, menuPutOne, menuTreeFields } from '@/api/system/menu'
import FdTagInput from '@/components/tag-input/index.vue'
import FdIconSelector from '@/components/icon/icon-selector.vue'

export default defineComponent({
  name: 'SystemMenuEdit',
  components: { FdTagInput, FdIconSelector },
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
    const stateOption = {
      idField: menuFields.idField,
      treeFields: menuTreeFields,
      getApi: menuGetOne,
      listApi: menuList,
      postApi: menuPostOne,
      putApi: menuPutOne,
      dicts: menuDicts,
      resetFormData: {
        id: '',
        parentId: '',
        name: '',
        url: '',
        redirect: '',
        perms: '',
        typeDict: '',
        icon: '',
        abbr: '',
        sort: 0,
        remark: '',
        visible: true
      },
      formRule: {
        name: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
        typeDict: [{ required: true, message: '类型不能为空', trigger: 'blur' }]
      },

      perms: [] as string[]
    }

    const { mixRefs, mixState, mixMethods } = useTreeEdit(stateOption, emit)

    mixMethods.onBeforeOpen(async () => {
      mixState.perms = mixState.formData.perms ? mixState.formData.perms.split(',') : []
    })

    mixMethods.onAfterGetData(async (data) => {
      mixState.formData = data
    })

    mixMethods.onBeforeSubmitData(async () => {
      mixState.formData.perms = mixState.perms.join(',')
    })

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixMethods
    }
  }
})
</script>
