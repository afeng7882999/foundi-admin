<template>
  <div :style="docMinHeight" class="page-user-profile fd-page">
    <fd-page-header v-show="showPageHeader" :title="state.currentUser.username + '的资料'"></fd-page-header>
    <el-row :gutter="8">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="main-card">
            <el-tooltip :show-after="500" content="点击更换头像" effect="dark" placement="right">
              <fd-image-cropper
                ref="avatarCropper"
                :default-img="DEFAULT_AVATAR"
                :img-ratio="[1, 1]"
                :show-circle="true"
                :model-value="localOrRemoteUrl(state.currentUser.avatar, 'upload')"
                class="main-avatar"
                @img-uploaded="avatarChanged"
              ></fd-image-cropper>
            </el-tooltip>
            <div class="main-name">{{ state.currentUser.username }}</div>
            <div class="main-roles">
              <el-tag v-for="item in state.roleNames" :key="item" :menu-item="item" class="role-tag">
                {{ item }}
              </el-tag>
            </div>
            <div class="profile-divider"></div>
            <div v-waves class="main-action" @click="onChangeAvatarClick">
              <fd-icon class="action-icon" icon="smiling-face"></fd-icon>
              <span class="action-title">更换头像</span>
            </div>
            <div v-waves class="main-action" @click="onEditClick">
              <fd-icon class="action-icon" icon="user-log"></fd-icon>
              <span class="action-title">修改基本信息</span>
            </div>
            <div class="profile-divider"></div>
            <div v-waves class="main-action" @click="onChangePasswordClick">
              <fd-icon class="action-icon" icon="key"></fd-icon>
              <el-badge :is-dot="state.currentUser.noPassword" class="item">
                <span class="action-title">{{ state.currentUser.noPassword ? '设置密码' : '修改密码' }}</span>
              </el-badge>
            </div>
            <div v-waves class="main-action" @click="onChangeMobileClick">
              <fd-icon class="action-icon" icon="iphone"></fd-icon>
              <el-badge :is-dot="!state.currentUser.mobile" class="item">
                <span class="action-title">{{ state.currentUser.mobile ? '修改手机' : '绑定手机' }}</span>
              </el-badge>
            </div>
            <div v-waves class="main-action" @click="onChangeEmailClick">
              <fd-icon class="action-icon" icon="mail"></fd-icon>
              <el-badge :is-dot="!state.currentUser.email" class="item">
                <span class="action-title">{{ state.currentUser.email ? '修改邮箱' : '绑定邮箱' }}</span>
              </el-badge>
            </div>
            <el-button class="main-btn" plain type="danger" @click="onLogoutClick">退出登录</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card shadow="hover">
          <div class="desc-card">
            <div class="desc-title" @click="onEditClick">
              <span>我的基本信息</span>
              <el-tooltip :show-after="500" content="修改基本信息" effect="dark" placement="right">
                <el-button size="small" type="primary">修改基本信息</el-button>
              </el-tooltip>
            </div>
            <div class="desc-list with-icon">
              <fd-icon class="list-icon" icon="people"></fd-icon>
              <span class="list-title">账号</span>
              <span class="list-item">{{ state.currentUser.username }}</span>
            </div>
            <div class="desc-list with-icon">
              <fd-icon class="list-icon" icon="role"></fd-icon>
              <span class="list-title">角色</span>
              <span class="list-item">{{ roleNameList }}</span>
            </div>
            <div class="desc-list">
              <span class="list-title">姓名</span>
              <span class="list-item">{{ state.currentUser.name }}</span>
            </div>
            <div class="desc-list">
              <span class="list-title">性别</span>
              <span class="list-item">{{ dictVal(state.dicts?.gender, state.currentUser.genderDict) }}</span>
            </div>
            <div class="desc-list with-icon">
              <fd-icon class="list-icon" icon="peoples"></fd-icon>
              <span class="list-title">用户组</span>
              <span class="list-item">{{ state.currentUser.groupName }}</span>
            </div>
            <div class="desc-list">
              <span class="list-title">地址</span>
              <span class="list-item">{{ state.currentUser.province }} / {{ state.currentUser.city }}</span>
            </div>
            <div class="desc-list">
              <span class="list-title">注册时间</span>
              <span class="list-item">{{ state.currentUser.createAt }}</span>
            </div>
          </div>
        </el-card>
        <el-card shadow="hover">
          <div class="desc-card">
            <div class="desc-title" @click="onEditClick">
              <span>我的绑定信息</span>
            </div>
            <div :class="{ danger: !state.currentUser.hasPassword }" class="desc-list with-icon">
              <fd-icon class="list-icon" icon="key"></fd-icon>
              <span class="list-title">密码</span>
              <span class="list-item">{{ state.currentUser.noPassword ? '未设定' : '已设定' }}</span>
              <span class="list-desc">使用账号密码登录</span>
              <span class="list-act">
                <el-button :type="state.currentUser.noPassword ? 'danger' : 'primary'" size="small" @click="onChangePasswordClick">
                  {{ state.currentUser.noPassword ? '设定' : '修改' }}
                </el-button>
              </span>
            </div>
            <div :class="{ danger: !state.currentUser.mobile }" class="desc-list with-icon">
              <fd-icon class="list-icon" icon="iphone"></fd-icon>
              <span class="list-title">手机</span>
              <span class="list-item">{{ state.currentUser.mobile ? state.currentUser.mobile : '未绑定' }}</span>
              <span class="list-desc">使用手机登录; 通过手机找回密码</span>
              <span class="list-act">
                <el-button v-if="state.currentUser.mobile" plain size="small" type="warning" @click="onClearMobileClick">清除</el-button>
                <el-button :type="state.currentUser.mobile ? 'primary' : 'danger'" size="small" @click="onChangeMobileClick">
                  {{ state.currentUser.mobile ? '修改' : '绑定' }}
                </el-button>
              </span>
            </div>
            <div :class="{ danger: !state.currentUser.email }" class="desc-list with-icon">
              <fd-icon class="list-icon" icon="mail"></fd-icon>
              <span class="list-title">邮箱</span>
              <span class="list-item">{{ state.currentUser.email ? state.currentUser.email : '未绑定' }}</span>
              <span class="list-desc">通过邮箱找回密码</span>
              <span class="list-act">
                <el-button v-if="state.currentUser.email" plain size="small" type="warning" @click="onClearEmailClick">清除</el-button>
                <el-button :type="state.currentUser.email ? 'primary' : 'danger'" size="small" @click="onChangeEmailClick">
                  {{ state.currentUser.email ? '修改' : '绑定' }}
                </el-button>
              </span>
            </div>
            <div :class="{ danger: state.currentUser.noWeixin }" class="desc-list with-icon">
              <fd-icon class="list-icon" icon="wechat"></fd-icon>
              <span class="list-title">微信</span>
              <span class="list-item">{{ state.currentUser.noWeixin ? '未绑定' : '已绑定' }}</span>
              <span class="list-desc">使用微信扫码登录</span>
              <span class="list-act">
                <el-button v-if="!state.currentUser.noWeixin" plain size="small" type="warning" @click="onClearWeixinClick">清除</el-button>
                <el-button :type="state.currentUser.noWeixin ? 'danger' : 'primary'" size="small" @click="onBindWeixinClick">
                  {{ state.currentUser.noWeixin ? '绑定' : '修改' }}
                </el-button>
              </span>
            </div>
            <div :class="{ danger: state.currentUser.noQQ }" class="desc-list with-icon">
              <fd-icon class="list-icon" icon="qq"></fd-icon>
              <span class="list-title">QQ</span>
              <span class="list-item">{{ state.currentUser.noQQ ? '未绑定' : '已绑定' }}</span>
              <span class="list-desc">使用QQ第三方登录</span>
              <span class="list-act">
                <el-button v-if="!state.currentUser.noQQ" plain size="small" type="warning" @click="onClearQQClick">清除</el-button>
                <el-button :type="state.currentUser.noQQ ? 'danger' : 'primary'" size="small" @click="onBindQQClick">
                  {{ state.currentUser.noQQ ? '绑定' : '修改' }}
                </el-button>
              </span>
            </div>
            <div :class="{ danger: state.currentUser.noWeibo }" class="desc-list with-icon">
              <fd-icon class="list-icon" icon="weibo"></fd-icon>
              <span class="list-title">微博</span>
              <span class="list-item">{{ state.currentUser.noWeibo ? '未绑定' : '已绑定' }}</span>
              <span class="list-desc">使用微博第三方登录</span>
              <span class="list-act">
                <el-button v-if="!state.currentUser.noWeibo" plain size="small" type="warning" @click="onClearWeiboClick">清除</el-button>
                <el-button :type="state.currentUser.noWeibo ? 'danger' : 'primary'" size="small" @click="onBindWeiboClick">
                  {{ state.currentUser.noWeibo ? '绑定' : '修改' }}
                </el-button>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <change-password ref="changPasswordDlg"></change-password>
    <add-password-dialog ref="addPasswordDlg" @refresh-data-list="getData"></add-password-dialog>
    <change-profile-dialog ref="changeProfileDlg" @refresh-data-list="getData"></change-profile-dialog>
    <change-mobile-dialog ref="changeMobileDlg" @refresh-data-list="getData"></change-mobile-dialog>
    <change-email-dialog ref="changeEmailDlg" @refresh-data-list="getData"></change-email-dialog>
    <bind-weixin-dialog ref="bindWeixinDlg" @refresh-data-list="getData"></bind-weixin-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'UserProfile'
}
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import useDict from '@b/crud/hooks/use-dict'
import FdImageCropper from '@/components/img-cropper/index.vue'
import { userLogout } from '@b/app/account'
import ChangePassword from '../system/user/change-password.vue'
import ChangeProfileDialog from './change-profile.vue'
import ChangeMobileDialog from './change-mobile.vue'
import { DEFAULT_AVATAR } from '@b/store/modules/user'
import AddPasswordDialog from './add-password.vue'
import ChangeEmailDialog from './change-email.vue'
import BindWeixinDialog from './bind-weixin.vue'
import { DictItem, DictList } from '@b/api/system/dict-item'
import {
  currentBindQQ,
  currentBindWeibo,
  currentChangeAvatar,
  currentClearEmail,
  currentClearMobile,
  currentClearQQ,
  currentClearWeibo,
  currentClearWeixin,
  getCurrentInfo,
  User
} from '@b/api/system/user'
import { groupList, Group } from '@b/api/system/group'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import usePage from '@/crud/hooks/use-page'
import { getQQUrl, getWeiboUrl } from '@b/api/system/login'
import settings from '@b/app/settings'
import { localOrRemoteUrl } from '@b/utils/query'
import { Role } from '@b/api/system/role'
import { AnyFunction } from '@b/common/types'

const state = reactive({
  currentUser: {} as User,
  dicts: {
    gender: [] as DictItem[],
    logTypes: [] as DictItem[],
    fileTypes: [] as DictItem[]
  } as DictList,
  roleNames: [] as string[],
  groupList: [] as Group[],
  checkAuthcRate: 2000, // 2 seconds
  checkAuthcTimes: 60, // 2 minutes
  clockForBind: null as number | null
})

const roleNameList = computed(() => {
  if (state.roleNames) {
    return state.roleNames.join(', ')
  }
  return ''
})

onMounted(() => {
  getData()
})

onBeforeUnmount(() => {
  clearClock()
})

const { getDictData, dictVal } = useDict(state.dicts)

const getData = async () => {
  try {
    const all = await Promise.all([await getDictData(), await groupList(), await getCurrentInfo()])
    state.groupList = all[1].data
    state.currentUser = all[2].user
    state.roleNames = all[2].roles.map((r: Role) => r.name)
  } catch (e) {
    console.log(e)
  }
}

const getGroupName = (id: string) => {
  const group = state.groupList.find((g) => g.id === id)
  return group ? (group as Group).name : '无'
}

const avatarCropper = ref()
const onChangeAvatarClick = () => {
  avatarCropper.value.uploadShow()
}
const avatarChanged = async (avatar: string) => {
  try {
    await currentChangeAvatar(avatar)
    ElMessage({
      message: '操作成功',
      type: 'success',
      duration: 1500,
      onClose: async () => {
        await getData()
      }
    })
  } catch (e) {
    console.log(e)
  }
}

const changPasswordDlg = ref()
const addPasswordDlg = ref()
const onChangePasswordClick = () => {
  if (state.currentUser.hasPassword) {
    changPasswordDlg.value.open()
  } else {
    addPasswordDlg.value.open()
  }
}

const router = useRouter()
const onLogoutClick = async () => {
  try {
    await ElMessageBox.confirm(`是否退出?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await userLogout()
    await router.push('/login')
  } catch (e) {
    console.log(e)
  }
}

const changeProfileDlg = ref()
const onEditClick = () => {
  changeProfileDlg.value.open(state.currentUser.id)
}

const changeMobileDlg = ref()
const onChangeMobileClick = () => {
  ;(changeMobileDlg.value as any).open()
}
const onClearMobileClick = async () => {
  await clearBind(currentClearMobile)
}

const changeEmailDlg = ref()
const onChangeEmailClick = () => {
  ;(changeEmailDlg.value as any).open()
}
const onClearEmailClick = async () => {
  await clearBind(currentClearEmail)
}

const bindWeixinDlg = ref()
const onBindWeixinClick = () => {
  ;(bindWeixinDlg.value as any).open()
}
const onClearWeixinClick = async () => {
  await clearBind(currentClearWeixin)
}

const onBindQQClick = async () => {
  try {
    const { authzUrl, state } = await getQQUrl(settings.appName)
    if (authzUrl && state) {
      window.open(authzUrl, '_blank')
      await nextTick(() => {
        checkAuthc(state, currentBindQQ)
      })
    }
  } catch (e) {
    console.log(e)
  }
}
const onClearQQClick = async () => {
  await clearBind(currentClearQQ)
}

const onBindWeiboClick = async () => {
  try {
    const { authzUrl, state } = await getWeiboUrl(settings.appName)
    if (authzUrl && state) {
      window.open(authzUrl, '_blank')
      await nextTick(() => {
        checkAuthc(state, currentBindWeibo)
      })
    }
  } catch (e) {
    console.log(e)
  }
}
const onClearWeiboClick = async () => {
  await clearBind(currentClearWeibo)
}

const checkAuthc = async (checkState: string, checkApi: AnyFunction) => {
  clearClock()
  let times = 0
  state.clockForBind = window.setInterval(async () => {
    try {
      const success = await checkApi(checkState)
      if (success) {
        clearClock()
        await getData()
      }
      times = times + 1
      if (times >= state.checkAuthcTimes) {
        clearClock()
      }
    } catch (e) {
      clearClock()
      console.log(e)
    }
  }, state.checkAuthcRate)
}

const clearBind = async (clearApi: AnyFunction) => {
  try {
    await ElMessageBox.confirm(`是否清除?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await clearApi()
    ElMessage({
      message: '操作成功',
      type: 'success',
      duration: 1500,
      onClose: async () => {
        await getData()
      }
    })
  } catch (e) {
    console.log(e)
  }
}

const clearClock = () => {
  if (state.clockForBind) {
    window.clearInterval(state.clockForBind)
  }
}

const { docMinHeight, showPageHeader } = usePage()
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@use '../base/src/assets/style/variable' as *;

.page-user-profile {
  ::v-deep(.el-card) {
    margin-bottom: 8px;
    border: none;

    .el-card__body {
      padding: 0;
    }
  }

  .profile-divider {
    position: relative;
    display: block;
    margin: 8px 0;
    width: calc(100% - 8px);
    height: 0;
    border-top: 1px solid var(--el-border-color);
    align-self: center;
  }

  .main-card {
    display: flex;
    flex-direction: column;
    align-items: center;

    .main-avatar {
      width: 101px;
      height: 101px;
      margin-top: 32px;
      border-radius: 50%;
    }

    .main-name {
      padding: 16px 0 8px 0;
      font-size: var(--el-font-size-large);
      font-weight: $font-weight-bold;
    }

    .main-roles {
      display: flex;
      padding: 8px 16px;
      flex-wrap: wrap;
      justify-content: center;
      font-size: var(--el-font-size-extra-small);
      color: var(--el-text-color-regular);

      .role-tag {
        margin: 0 4px;
      }
    }

    .main-btn {
      margin: 32px 0 16px 0;
    }

    .main-action {
      display: flex;
      height: 40px;
      width: 100%;
      padding: 0 8px;
      align-items: center;
      font-size: var(--el-font-size-base);
      border-left: 2px solid var(--el-color-white);
      cursor: pointer;
      user-select: none;

      &:hover {
        padding-left: 8px;
        color: var(--el-color-primary);
        border-left: 2px solid var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      .action-icon {
        margin: 0 8px 0 8px;
        font-size: $icon-size-middle;
      }

      .action-title {
        margin-right: 8px;
      }
    }
  }

  .desc-card {
    display: flex;
    padding-bottom: 16px;
    font-size: var(--el-font-size-base);
    flex-direction: column;
    align-items: flex-start;

    .desc-title {
      display: flex;
      width: 100%;
      height: 48px;
      padding: 16px;
      margin-bottom: 16px;
      align-items: center;
      justify-content: space-between;
      color: var(--el-color-primary);
      background-color: var(--el-bg-color);
    }

    .desc-list {
      display: flex;
      height: 40px;
      width: 100%;
      padding: 0 8px 0 48px;
      align-items: center;
      color: var(--el-color-text-regular);
      border-left: 2px solid var(--el-color-white);

      &.with-icon {
        padding-left: 12px;
      }

      &:hover {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        border-left: 2px solid var(--el-color-primary);

        .list-desc {
          color: var(--el-color-primary);
        }
      }

      &.danger {
        .list-item {
          color: var(--el-color-danger);
        }

        &:hover {
          .list-item {
            color: var(--el-color-danger);
          }
        }
      }

      .list-icon {
        margin: 0 10px 0 8px;
        font-size: $icon-size-middle;
      }

      .list-title {
        margin-right: 10px;
        width: 80px;
      }

      .list-item {
        flex: 1;
        text-overflow: ellipsis;
      }

      .list-desc {
        flex: 1;
        color: var(--el-text-color-placeholder);
        text-overflow: ellipsis;
      }

      .list-act {
        width: 150px;
        margin-right: 10px;
        text-align: right;
      }
    }
  }
}
</style>
