<template>
  <div class="fd-user-profile">
    <img class="fd-user-profile__avatar" :src="avatar" alt="" @mouseenter="openMenu" />
  </div>
  <fd-contextmenu ref="contextMenu" target trigger="enter" :show-delay="300">
    <fd-contextmenu-item icon="people" label="用户信息" @click="onInfoClick" />
    <fd-contextmenu-item divider />
    <fd-contextmenu-item icon="logout" label="退出登录" @click="onLogoutClick" />
  </fd-contextmenu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { userLogout } from '@b/app/account'
import { useStore } from '@/store'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { localOrRemoteUrl } from '@b/utils/query'

defineOptions({
  name: 'FdUserProfile'
})

const store = useStore()
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

const contextMenu = ref()
const openMenu = (e: PointerEvent) => {
  contextMenu.value.show(e)
}
</script>

<style lang="scss">
.fd-user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 32px;
  }
}
</style>
