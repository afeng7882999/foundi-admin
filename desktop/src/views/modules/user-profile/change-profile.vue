<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" title="基本信息" width="70%">
    <el-form ref="form" :model="formData" :rules="formRule" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="长度5-20,字母开头,可包含字母,数字,下划线,点"></el-input>
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="formData.name" placeholder="姓名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="出生日期" prop="birthday">
            <el-date-picker v-model="formData.birthday" placeholder="出生日期" style="width: 100%" type="date"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="性别" prop="genderDict">
            <el-select v-model="formData.genderDict" style="width: 100%">
              <el-option v-for="item in dicts.gender" :key="item.itemKey" :label="item.itemValue" :value="item.itemKey"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="城市地区" prop="province">
        <fd-region-cascader v-model="formData.userRegion" placeholder="城市地区" style="width: 100%" />
      </el-form-item>
      <el-form-item label="住址" prop="address">
        <el-input v-model="formData.address" :rows="2" placeholder="住址" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="fd-dialog__footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import useEdit, { REFRESH_DATA_EVENT } from '@b/crud/hooks/use-edit'
import FdRegionCascader from '@/components/region-cascader/index.vue'
import { currentCheckUsername, currentEdit, User, userGetOne } from '@b/api/system/user'
import { DictItem } from '@b/api/system/dict-item'
import { omit } from 'lodash-es'
import { validUsername } from '@b/utils/validate'

export default defineComponent({
  name: 'UserProfileChange',
  components: { FdRegionCascader },
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
    const validateUsername = async (rule: any, value: string, callback: any) => {
      if (!value || value === '') {
        callback(new Error('用户名不能为空'))
      } else if (!validUsername(value)) {
        callback(new Error('请输入长度5-20，汉字、字母开头的用户名(可包含字母, 数字, "_", ".")'))
      } else {
        try {
          const canUse = await currentCheckUsername(value)
          if (!canUse) {
            callback(new Error('用户名已经被占用'))
          } else {
            callback()
          }
        } catch (e) {
          callback(new Error('检测用户名出错'))
        }
      }
    }

    const stateOption = {
      getApi: userGetOne,
      putApi: currentEdit,
      dicts: {
        gender: [] as DictItem[]
      },
      resetFormData: {
        username: '',
        name: '',
        avatar: '',
        genderDict: '0',
        birthday: '',
        address: '',
        userRegion: {
          province: '',
          city: '',
          district: ''
        }
      },
      formRule: {
        username: [{ required: true, validator: validateUsername, trigger: 'blur' }]
      }
    }

    const { editRefs, editState, editMethods } = useEdit<User>(stateOption, emit)

    editMethods.onAfterGetData(async (data) => {
      editState.formData = data
      editState.formData.userRegion = {
        province: data.province,
        city: data.city,
        district: data.district
      }
    })

    editMethods.onBeforeSubmitData(async () => {
      editState.formData.province = editState.formData.userRegion.province
      editState.formData.city = editState.formData.userRegion.city
      editState.formData.district = editState.formData.userRegion.district
      editState.formData = omit(editState.formData, ['userRegion'])
    })

    return {
      ...editRefs,
      ...toRefs(editState),
      ...editMethods,
      validateUsername
    }
  }
})
</script>
