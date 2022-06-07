<template>
  <div class="fd-user-profile-button" @mouseenter="openMenu">
    <img class="fd-user-profile-button__avatar" :src="avatar" alt="" />
    <div class="fd-user-profile-button__user">
      <span class="user-name">{{ user.username }}</span>
      <fd-icon class="button-icon" icon="right" />
    </div>
  </div>
  <fd-contextmenu ref="contextMenu" target trigger="enter" :show-delay="300">
    <fd-contextmenu-item icon="people" label="我的信息" @click="onInfoClick" />
    <fd-contextmenu-item divider />
    <fd-contextmenu-item icon="logout" label="退出登录" @click="onLogoutClick" />
  </fd-contextmenu>
</template>

<script lang="ts">
export default {
  name: 'FdUserProfileButton'
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { userLogout } from '@b/app/account'
import store from '@b/store'
import { useRouter } from 'vue-router'
import { localOrRemoteUrl } from '@b/utils/query'
import { messageBoxConfirm } from '@b/common/global'
import FdContextmenu from '@b/components/contextmenu/contextmenu.vue'
import FdContextmenuItem from '@b/components/contextmenu/item.vue'
import FdIcon from '@b/components/icon/icon.vue'

const storeState = store.state
const router = useRouter()

const user = computed(() => {
  return storeState.user.user
})

const avatar = computed(() => {
  return localOrRemoteUrl(user.value.avatar, 'upload')
})

const onInfoClick = () => {
  router.push('/userProfile')
}

const onLogoutClick = async () => {
  try {
    await messageBoxConfirm('是否退出？', '提示')
    await userLogout()
    await router.push('/login')
  } catch (e) {
    console.log(e)
  }
}

const contextMenu = ref()
const openMenu = (e: PointerEvent) => {
  contextMenu.value.show(e)
}
</script>

<style lang="scss">
@use '../base/src/assets/style/variable' as *;

.fd-user-profile-button {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  cursor: pointer;

  &__avatar {
    display: block;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0);
    image-rendering: -webkit-optimize-contrast;
  }

  &__user {
    display: flex;
    align-items: center;
    .user-name {
      margin: 0 2px 0 8px;
      font-size: $font-size-base;
    }
    .button-icon {
      font-size: $font-size-small;
      transform: rotate(90deg);
    }
  }

  &:hover {
    .fd-user-profile-button__avatar {
      box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
    }
  }
}
</style>
