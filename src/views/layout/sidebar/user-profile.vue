<template>
  <div class="fd-user-profile" :class="{ 'is-minimized': minimized }">
    <img class="fd-user-profile__avatar" :src="avatar" alt="" />
    <div class="fd-user-profile__info">
      <span class="user-name">{{ user.username }}</span>
      <span class="user-roles">{{ userRoles }}</span>
    </div>
    <div class="fd-user-profile__act">
      <el-button type="primary" size="small" @click="onInfoClick">用户信息</el-button>
      <el-button type="danger" size="small" @click="onLogoutClick">退出登录</el-button>
    </div>
    <fd-icon class="fd-user-profile__more" icon="more"></fd-icon>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { userLogout } from '@/app/account'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { localOrRemoteUrl } from '@/utils/query'

defineOptions({
  name: 'FdUserProfile'
})

const props = defineProps({
  minimized: {
    type: Boolean,
    default: false
  }
})

const store = useStore<AllState>()
const storeState = store.state as AllState
const router = useRouter()

const user = computed(() => {
  return storeState.user.user
})

const roles = computed(() => {
  return storeState.user.roles
})

const avatar = computed(() => {
  return localOrRemoteUrl(user.value.avatar, 'upload')
})

const userRoles = computed(() => {
  if (roles.value) {
    return roles.value.map((item) => item.name).join(',')
  } else {
    return ''
  }
})

const onInfoClick = () => {
  router.push('/userProfile')
}

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
</script>

<style lang="scss">
@use 'src/assets/style/variable.scss' as *;

@mixin minimized() {
  &__avatar {
    transition: transform $sidebar-transition-time;
  }
  &__info {
    opacity: 1;
    transition: transform $sidebar-transition-time, opacity $sidebar-transition-time;
  }
  &__more {
    opacity: 1;
    transition: opacity $sidebar-transition-time;
  }

  &.is-minimized {
    .fd-user-profile__avatar {
      transform: translateX(-12px) scale(0.71);
    }

    .fd-user-profile__info {
      transform: translateX(-25px);
      opacity: 0;
    }

    .fd-user-profile__more {
      opacity: 0;
    }
  }
}

@mixin hover() {
  &__act {
    transition: opacity $sidebar-transition-time, transform $sidebar-transition-time;
  }

  &:hover {
    .fd-user-profile__avatar {
      transform: translateX(-12px) scale(0.71);
    }
    .fd-user-profile__info {
      opacity: 0;
    }
    .fd-user-profile__act {
      transform: translateX(-70px);
      opacity: 1;
    }
    .fd-user-profile__more {
      opacity: 0;
    }
  }
}

.fd-user-profile {
  position: relative;
  display: flex;
  padding: 16px 16px 16px 0;
  overflow: hidden;

  &:hover {
    background: var(--fd-sidebar-hover-color);
  }

  &__avatar {
    display: inline-block;
    width: 48px;
    height: 48px;
    margin-right: 13px;
    border-radius: 50%;
    margin-left: 14px;
    box-shadow: $box-shadow-dark;
  }

  &__info {
    width: 130px;
    padding-top: 4px;
    overflow: hidden;
    transition: width $sidebar-transition-time;

    .user-name {
      width: 130px;
      font-size: var(--el-font-size-base);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .user-roles {
      padding-top: 4px;
      width: 130px;
      font-size: var(--el-font-size-extra-small);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  &__act {
    position: absolute;
    left: 130px;
    top: 28px;
    display: flex;
    align-items: center;
    overflow: hidden;
    opacity: 0;
  }

  &__more {
    position: absolute;
    top: 30px;
    right: 15px;
    color: var(--fd-sidebar-text-placeholder-color);
    font-size: $icon-size-middle;
  }

  @include minimized();
  @include hover();
}
</style>
