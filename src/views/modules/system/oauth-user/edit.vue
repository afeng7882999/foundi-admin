<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :title="isCreate ? '新增' : '修改'" @closed="hideDialog">
    <el-form ref="form" :model="formData" :rules="formRule" label-width="80px" @keyup.enter="submit()">
      <el-form-item label="账号" prop="account">
        <el-input v-model="formData.account" placeholder="请输入账号"></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="formData.nickName" placeholder="请输入昵称"></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="genderDict">
        <el-select v-model="formData.genderDict" style="width: 100%">
          <el-option v-for="item in dicts.gender" :key="item.itemKey" :label="item.itemValue" :value="item.itemKey"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="OpenId" prop="openId">
        <el-input v-model="formData.openId" placeholder="请输入OpenId"></el-input>
      </el-form-item>
      <el-form-item label="认证类型" prop="authcTypeDict">
        <el-select v-model="formData.authcTypeDict" style="width: 100%">
          <el-option v-for="item in dicts.sysAuthcType" :key="item.itemKey" :label="item.itemValue" :value="item.itemKey"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联user" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入关联user"></el-input>
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
import { OAuthUser, oauthUserDicts, oauthUserFields, oauthUserGetOne, oauthUserPostOne, oauthUserPutOne } from '@/api/system/oauth-user'

export default defineComponent({
  name: 'SystemOauthUserEdit',
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
    const stateOption = {
      idField: oauthUserFields.idField,
      getApi: oauthUserGetOne,
      postApi: oauthUserPostOne,
      putApi: oauthUserPutOne,
      dicts: oauthUserDicts,
      resetFormData: {
        id: '',
        account: '',
        nickName: '',
        avatar: '',
        genderDict: '',
        openId: '',
        authcTypeDict: '',
        userId: '0'
      },
      formRule: {
        account: [{ required: true, message: '账号不能为空', trigger: 'blur' }]
      }
    }

    const { editRefs, editState, editMethods } = useEdit<OAuthUser>(stateOption, emit)

    return {
      ...editRefs,
      ...toRefs(editState),
      ...editMethods
    }
  }
})
</script>
