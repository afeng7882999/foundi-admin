<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="isCreate ? '新增' : '修改'" width="80%" @closed="hideDialog">
    <el-form ref="form" :model="formData" :rules="formRule" label-width="80px" size="medium">
      <el-form-item label="配置分类" prop="configTypeDict">
        <el-select v-model="formData.configTypeDict" style="width: 100%">
          <el-option v-for="item in dicts.sysConfigType" :key="item.itemKey" :label="item.itemValue" :value="item.itemKey"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="键" prop="configKey">
        <el-input v-model="formData.configKey" placeholder="请输入键"></el-input>
      </el-form-item>
      <el-form-item class="json-editor-form-item" label="值" prop="configValue">
        <fd-code-editor ref="jsonEditor" v-model:value="formData.configValue" border language="application/json" line-numbers />
      </el-form-item>
      <el-form-item label="是否启用" prop="enabled">
        <el-switch v-model="formData.enabled" active-text="是" inactive-text="否"></el-switch>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" :autosize="{ minRows: 3 }" placeholder="请输入备注" type="textarea"></el-input>
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
import { defineComponent, ref, toRefs } from 'vue'
import useListEdit, { REFRESH_DATA_EVENT } from '@/components/crud/use-list-edit'
import { configDicts, configFields, configGetOne, configPostOne, configPutOne } from '@/api/system/config'
import FdCodeEditor from '@/components/code-editor/index.vue'
import { nextFrame } from '@/utils/next-frame'
import {omit} from "lodash-es";

export default defineComponent({
  name: 'SystemConfigEdit',
  components: { FdCodeEditor },
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
    const jsonEditor = ref()

    const stateOption = {
      idField: configFields.idField,
      getApi: configGetOne,
      postApi: configPostOne,
      putApi: configPutOne,
      dicts: configDicts,
      resetFormData: {
        id: '',
        configTypeDict: '',
        configKey: '',
        configValue: '',
        enabled: '',
        remark: ''
      },
      formRule: {
        configKey: [{ required: true, message: '键不能为空', trigger: 'blur' }],
        configValue: [{ required: true, message: '值不能为空', trigger: 'blur' }]
      },
      json: ''
    }

    const { mixRefs, mixState, mixMethods } = useListEdit(stateOption, emit)

    const handleJsonChange = (val: string) => {
      if (mixState.json !== val) {
        mixState.json = val
      }
    }

    mixMethods.onBeforeOpen(async () => {
      if (mixState.isCreate) {
        nextFrame(() => {
          ;(jsonEditor.value as any).refresh()
        })
      }
    })

    mixMethods.onBeforeSubmitData(async () => {
      mixState.formData.test1 = '1614657600000'
      mixState.formData.test2 = ['1614657600000', '1639900851891']
      mixState.formData.test3 = {t1: '1614657600000', t2: ''}
      mixState.formData.test4 = ['1614657600000', '1639900851891']
    })

    return {
      jsonEditor,
      ...mixRefs,
      ...toRefs(mixState),
      ...mixMethods,
      handleJsonChange
    }
  }
})
</script>

<style lang="scss" scoped>
.el-form-item.json-editor-form-item {
  ::v-deep(.el-form-item__content) {
    overflow: hidden;
  }
}
</style>
