<template>
  <div v-if="auth('demo:virtualGrid:list')" :style="docMinHeight" class="page-demo-virtual-grid fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <el-affix :offset="58">
      <div class="fd-page__form">
        <el-input v-model="scrollTo" placeholder="转到..." />
        <fd-button label="切换宽度" @click="toggleWidth" />
        <fd-button label="切换高度" @click="toggleHeight" />
      </div>
    </el-affix>
    <fd-virtual-grid
      :length="length"
      :wrapper-width="wrapperW"
      :wrapper-height="wrapperH"
      :item-min-width="300"
      :page-size="pageSize"
      :page-provider="pageProvider"
      :scroll-to="Number(scrollTo)"
      style="align-self: center"
    >
      <template #placeholder="{ style }">
        <demo-img-card :style="style"></demo-img-card>
      </template>
      <template #default="{ index, item, style }">
        <demo-img-card :src="localOrRemoteUrl(item.url, 'upload')" :filename="index + ': ' + item.name" :style="style"></demo-img-card>
      </template>
    </fd-virtual-grid>
    <el-backtop />
  </div>
</template>

<script setup lang="ts">
import usePage from '@/extend/page/use-page'
import DemoImgCard from './card.vue'
import { fileList } from '@/api/system/file'
import { computed, ref } from 'vue'
import { localOrRemoteUrl } from '@/utils/query'

defineOptions({
  name: 'DemoVirtualGrid'
})

const length = ref<number>(200)
const pageSize = ref<number>(40)
const scrollTo = ref<number>(0)

const provider = async (pageNumber: number, pageSize: number) => {
  const { data, total } = await fileList({ current: pageNumber, size: pageSize })
  total && (length.value = total)
  return data
}
const pageProvider = computed(() => {
  return provider
})

const wrapperW = ref<number | undefined>(undefined)
const wrapperH = ref<number | undefined>(undefined)

const toggleWidth = () => {
  if (wrapperW.value === 800) {
    wrapperW.value = 500
    return
  }
  if (wrapperW.value === 500) {
    wrapperW.value = undefined
    return
  }
  wrapperW.value = 800
}

const toggleHeight = () => {
  if (wrapperH.value === 500) {
    wrapperH.value = 300
    return
  }
  if (wrapperH.value === 300) {
    wrapperH.value = undefined
    return
  }
  wrapperH.value = 500
}

const { docMinHeight, showPageHeader, auth } = usePage()
</script>
