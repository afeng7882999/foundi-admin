<template>
  <div class="fd-page-header">
    <div v-show="showBack" class="fd-page-header__back">
      <fd-icon-button icon="left" @click="goBack"></fd-icon-button>
    </div>
    <el-divider v-show="showBack" class="fd-page-header__divider" direction="vertical"></el-divider>
    <div class="fd-page-header__title">
      <fd-icon :icon="currentIcon"></fd-icon>
      <span>{{ currentTitle }}</span>
    </div>
    <el-divider v-if="currentDesc" class="fd-page-header__divider" direction="vertical"></el-divider>
    <div class="fd-page-header__desc">
      <span>{{ currentDesc }}</span>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdPageHeader'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import usePage from '@/components/page/use-page'

const props = defineProps({
  icon: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  },
  desc: {
    type: String,
    default: ''
  }
})

const { pageState: state, goBack } = usePage()

const currentTitle = computed(() => {
  return props.title ? props.title : state.title
})

const currentIcon = computed(() => {
  return props.icon ? props.icon : state.icon
})

const currentDesc = computed(() => {
  return props.desc ? props.desc : state.desc
})
</script>
