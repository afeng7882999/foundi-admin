<template>
  <div v-if="auth('demo:virtualGrid:list')" :style="docMinHeight" class="page-demo-virtual-grid fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <el-affix :offset="58">
      <div class="fd-page__form">
        <el-input v-model="scrollTo" placeholder="转到..." />
      </div>
    </el-affix>
    <fd-virtual-grid
      :length="length"
      :page-size="pageSize"
      :page-provider="pageProvider"
      :class="$style.grid"
      :scroll-to="Number(scrollTo)"
    >
      <template #probe>
        <demo-img-card></demo-img-card>
      </template>
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

const { docMinHeight, showPageHeader, auth } = usePage()
</script>

<style lang="scss" module>
.grid {
  box-sizing: border-box;
  display: grid;
  place-content: center;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fit, 300px);
  margin: 0;
  padding: 8px;
}

@media (min-width: 760px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1140px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1520px) {
  .grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1900px) {
  .grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 2280px) {
  .grid {
    grid-template-columns: repeat(7, 1fr);
  }
}

@media (min-width: 2660px) {
  .grid {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (min-width: 3040px) {
  .grid {
    grid-template-columns: repeat(9, 1fr);
  }
}

@media (min-width: 3420px) {
  .grid {
    grid-template-columns: repeat(10, 1fr);
  }
}
</style>
