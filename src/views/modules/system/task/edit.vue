<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="isCreate ? '新增' : '修改'" @closed="hideDialog">
    <el-form ref="form" :model="formData" :rules="formRule" label-width="100px" @keyup.enter="submit()">
      <el-form-item label="任务名" prop="jobName">
        <el-input v-model="formData.jobName" placeholder="请输入任务名"></el-input>
      </el-form-item>
      <el-form-item label="任务分组" prop="jobGroup">
        <el-input v-model="formData.jobGroup" placeholder="请输入任务分组"></el-input>
      </el-form-item>
      <el-form-item label="cron表达式" prop="cronExpression">
        <el-input v-model="formData.cronExpression" placeholder="请输入cron表达式"></el-input>
      </el-form-item>
      <el-form-item label="任务是否并发" prop="isConcurrent">
        <el-checkbox-group v-model="formData.isConcurrent">
          <el-switch v-model="formData.isConcurrent" active-text="是" inactive-text="否"></el-switch>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="任务类名" prop="beanClass">
        <el-input v-model="formData.beanClass" placeholder="请输入任务类名"></el-input>
      </el-form-item>
      <el-form-item label="任务的方法名" prop="methodName">
        <el-input v-model="formData.methodName" placeholder="请输入任务的方法名"></el-input>
      </el-form-item>
      <el-form-item label="任务描述" prop="description">
        <el-input v-model="formData.description" placeholder="请输入任务描述"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="fd-dialog__footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useEdit, { REFRESH_DATA_EVENT } from '@/crud/hooks/use-edit'
import { Task, taskFields, taskGetOne, taskPostOne, taskPutOne } from '@/api/system/task'

export default defineComponent({
  name: 'SystemTaskEdit',
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
    const stateOption = {
      idField: taskFields.idField,
      getApi: taskGetOne,
      postApi: taskPostOne,
      putApi: taskPutOne,
      resetFormData: {
        id: '',
        jobName: '',
        jobGroup: '',
        cronExpression: '',
        isConcurrent: '',
        beanClass: '',
        methodName: '',
        description: ''
      },
      formRule: {
        jobName: [{ required: true, message: '任务名不能为空', trigger: 'blur' }],
        cronExpression: [{ required: true, message: 'cron表达式不能为空', trigger: 'blur' }]
      }
    }

    const { editRefs, editState, editMethods } = useEdit<Task>(stateOption, emit)

    return {
      ...editRefs,
      ...toRefs(editState),
      ...editMethods
    }
  }
})
</script>
