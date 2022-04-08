<template>
  <div class="fd-page-header">
    <div v-show="showBack" class="fd-page-header__back">
      <fd-button type="icon" icon="left" @click="goBack"></fd-button>
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

<script setup lang="ts">
import { computed } from 'vue'
import useView from '@/extend/page/use-view'

defineOptions({
  name: 'FdPageHeader'
})

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

const { viewState: s, goBack } = useView()

const currentTitle = computed(() => {
  return props.title ? props.title : s.title
})

const currentIcon = computed(() => {
  return props.icon ? props.icon : s.icon
})

const currentDesc = computed(() => {
  return props.desc ? props.desc : s.desc
})
</script>
