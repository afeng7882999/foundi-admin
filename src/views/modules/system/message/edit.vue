<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="isCreate ? '新增' : '修改'">
    <el-form ref="form" :model="formData" :rules="formRule" label-width="80px" @keyup.enter="submit()">
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="信息内容" prop="content">
        <el-input v-model="formData.content" :autosize="{ minRows: 4 }" placeholder="请输入内容" type="textarea" />
      </el-form-item>
      <el-form-item label="信息类型" prop="typeDict">
        <el-select v-model="formData.typeDict" style="width: 100%">
          <el-option v-for="item in dicts.sysMessageType" :key="item.itemKey" :label="item.itemValue" :value="item.itemKey"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否群发" prop="isGroup">
        <el-switch v-model="formData.isGroup" active-text="是" inactive-text="否"></el-switch>
      </el-form-item>
      <el-form-item label="接收组" prop="groupId">
        <el-input v-model="formData.groupId" placeholder="请输入接收组"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useEdit, { REFRESH_DATA_EVENT } from '@/components/crud/use-edit'
import { messageDicts, messageFields, messageGetOne, messagePostOne, messagePutOne } from '@/api/system/message'

export default defineComponent({
  name: 'SystemMessageEdit',
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
    const stateOption = {
      idField: messageFields.idField,
      getApi: messageGetOne,
      postApi: messagePostOne,
      putApi: messagePutOne,
      dicts: messageDicts,
      resetFormData: {
        id: '',
        title: '',
        content: '',
        typeDict: '',
        isGroup: '',
        groupId: 0
      },
      formRule: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        content: [{ required: true, message: '信息内容不能为空', trigger: 'blur' }],
        typeDict: [{ required: true, message: '信息类型不能为空', trigger: 'blur' }]
      }
    }

    const { mixRefs, mixState, mixMethods } = useEdit(stateOption, emit)

    return {
      ...mixRefs,
      ...toRefs(mixState),
      ...mixMethods
    }
  }
})
</script>
