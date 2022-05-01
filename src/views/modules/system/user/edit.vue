<template>
  <fd-drawer
    v-model="visible"
    :close-on-click-modal="false"
    :modal="false"
    :title="state.isCreate ? '新增系统用户' : '修改系统用户'"
    size="600px"
    @closed="hideDialog"
  >
    <el-form ref="form" :model="formData" :rules="formRule" label-width="80px" @keyup.enter="submit">
      <el-row>
        <el-col :span="16">
          <el-row>
            <fd-item label="用户名" prop="username" />
          </el-row>
          <el-row>
            <fd-item-tree label="用户组" prop="groupId" :list="groupList" />
          </el-row>
        </el-col>
        <el-col :span="8">
          <fd-item-custom label="头像" prop="avatar">
            <fd-image-cropper
              v-model="formData.avatar"
              :img-ratio="[1, 1]"
              :show-circle="true"
              :default-img="defaultAvatar"
              style="width: 95px; height: 95px"
            ></fd-image-cropper>
          </fd-item-custom>
        </el-col>
      </el-row>
      <fd-item-list label="角色" prop="roleIdList" multi :list="roleList" />
      <fd-item-custom v-if="formData.hasPassword" label="密码">
        <el-button @click="showChangePassword(formData.id)">修改密码</el-button>
      </fd-item-custom>
      <template v-else>
        <fd-item label="密码" prop="password" placeholder="长度6-20,可包含字母,数字,下划线" />
        <fd-item label="确认密码" prop="checkPass" placeholder="与密码一致" />
      </template>
      <fd-item label="手机号" prop="mobile" />
      <fd-item label="邮箱" prop="email" />
      <fd-item-dict label="状态" prop="statusDict" :dict="dicts.sysUserStatus" />
      <el-row>
        <el-col :span="12">
          <fd-item label="姓名" prop="name" />
        </el-col>
        <el-col :span="12">
          <fd-item-dict label="性别" prop="genderDict" :dict="dicts.gender" />
        </el-col>
      </el-row>
      <fd-item-custom label="出生日期" prop="birthday">
        <el-date-picker
          v-model="formData.birthday"
          placeholder="出生日期"
          style="width: 100%"
          type="date"
          value-format="YYYY-MM-DD"
        ></el-date-picker>
      </fd-item-custom>
      <fd-item-custom label="城市地区" prop="province">
        <fd-region-cascader v-model="formData.userRegion" placeholder="城市地区" style="width: 100%" />
      </fd-item-custom>
      <fd-item-multiline label="住址" prop="address" />
    </el-form>
    <template #footer>
      <span class="fd-dialog__footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </fd-drawer>
  <ChangePassword ref="changePasswordDialog"></ChangePassword>
</template>

<script lang="ts">
import { computed, defineComponent, ref, toRefs } from 'vue'
import useEdit, { REFRESH_DATA_EVENT } from '@/crud/hooks/use-edit'
import { checkEmail, checkMobile, checkUsername, User, userDicts, userGetOne, userPostOne, userPutOne } from '@/api/system/user'
import FdImageCropper from '@/components/img-cropper/index.vue'
import { validEmail, validMobile, validPassword, validUsername } from '@/utils/validate'
import FdRegionCascader from '@/components/region-cascader/index.vue'
import { omit } from 'lodash-es'
import { groupList, Group } from '@/api/system/group'
import ChangePassword from './change-password.vue'
import { arrayToTree } from '@/utils/data-tree'
import { Role, roleList } from '@/api/system/role'
import { DEFAULT_AVATAR } from '@/store/modules/user'
import { RegionObj } from '@/components/region-cascader/types'

export default defineComponent({
  name: 'SystemUserEdit',
  components: { FdImageCropper, FdRegionCascader, ChangePassword },
  emits: [REFRESH_DATA_EVENT],
  setup(props, { emit }) {
    const changePasswordDialog = ref()

    const validateUsername = async (rule: any, value: string, callback: any) => {
      if (!value || value === '') {
        callback(new Error('用户名不能为空'))
      } else if (!validUsername(value)) {
        callback(new Error('请输入长度5-20，汉字、字母开头的用户名(可包含字母, 数字, "_", ".")'))
      } else {
        try {
          const canUse = await checkUsername(value, mixState.formData.id)
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

    const validatePassword = (rule: any, value: string, callback: any) => {
      if (!value) {
        callback(new Error('密码不能为空'))
      } else if (!validPassword(value)) {
        callback(new Error('请输入长度6-20的密码(可包含字母,数字,下划线)'))
      } else {
        callback()
      }
    }

    const validateCheckPass = (rule: any, value: string, callback: any) => {
      if (!value || value !== mixState.formData.password) {
        callback(new Error('两次输入密码必须一致'))
      } else {
        callback()
      }
    }

    const validateEmail = async (rule: any, value: string, callback: any) => {
      if (value) {
        if (!validEmail(value)) {
          callback(new Error('请输入正确的邮件地址'))
        } else {
          try {
            const data = await checkEmail(mixState.formData.id, value)
            if (!data) {
              callback(new Error('邮件地址已经被占用'))
            } else {
              callback()
            }
          } catch (e) {
            callback(new Error('检测邮箱地址出错'))
          }
        }
      }
    }

    const validateMobile = async (rule: any, value: string, callback: any) => {
      if (value) {
        if (!validMobile(value)) {
          callback(new Error('请输入正确的手机号码'))
        } else {
          try {
            const data = await checkMobile(mixState.formData.id, value)
            if (!data) {
              callback(new Error('手机号已经被占用'))
            } else {
              callback()
            }
          } catch (e) {
            callback(new Error('检测手机号出错'))
          }
        }
      }
    }

    const stateOption = {
      getApi: userGetOne,
      postApi: userPostOne,
      putApi: userPutOne,
      dicts: userDicts,
      groupList: [] as Group[],
      roleList: [] as Role[],
      resetFormData: {
        id: '',
        username: '',
        password: '',
        mobile: '',
        groupId: '',
        roleIdList: [],
        name: '',
        avatar: '',
        statusDict: '0',
        email: '',
        genderDict: '0',
        birthday: '',
        address: '',
        province: '',
        city: '',
        district: '',
        userRegion: {
          province: '',
          city: '',
          district: ''
        } as RegionObj,
        checkPass: ''
      },
      formRule: {
        username: [{ required: true, validator: validateUsername, trigger: 'blur' }],
        password: [{ validator: validatePassword, trigger: 'blur' }],
        checkPass: [{ validator: validateCheckPass, trigger: 'blur' }],
        email: [{ validator: validateEmail, trigger: 'blur' }],
        mobile: [{ validator: validateMobile, trigger: 'blur' }]
      }
    }

    const defaultAvatar = computed(() => DEFAULT_AVATAR)

    const { editRefs, editState, editMethods } = useEdit<User>(stateOption, emit)

    editMethods.onBeforeOpen(async () => {
      const { data: groups } = await groupList()
      const { data: roles } = await roleList()
      editState.groupList = arrayToTree(groups)
      editState.roleList = arrayToTree(roles)
    })

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
      editState.formData = omit(editState.formData, ['userRegion', 'checkPass'])

      // editState.formData.birthday = new Date(editState.formData.birthday).getTime()
      // console.log(editState.formData.birthday)
    })

    const showChangePassword = (id: string) => {
      changePasswordDialog.value.open(id)
    }

    return {
      changePasswordDialog,
      ...editRefs,
      ...toRefs(editState),
      ...editMethods,
      defaultAvatar,
      validateUsername,
      validatePassword,
      validateMobile,
      validateEmail,
      validateCheckPass,
      showChangePassword
    }
  }
})
</script>
