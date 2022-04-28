<template>
  <div v-if="auth('demo:virtualGrid:list')" :style="pageStyle" class="page-demo-virtual-grid fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div ref="actRef" class="fd-page-toolbar">
      <div class="fd-page-toolbar__left">
        <el-input v-model="scrollIdx" placeholder="跳转的项目序号" clearable />
        <fd-button label="跳转" @click="scrollToIdx" />
        <el-divider direction="vertical"></el-divider>
      </div>
      <div class="fd-page-toolbar__center">
        <el-pagination v-bind="paginationAttrs" />
      </div>
      <div class="fd-page-toolbar__right">
        <el-divider direction="vertical"></el-divider>
        <fd-button label="切换宽度" @click="toggleWidth" />
        <fd-button label="切换窗口模式" @click="togglePageMode" />
      </div>
    </div>
    <fd-virtual-grid
      ref="virtualGrid"
      :length="length"
      :item-min-width="300"
      :page-size="pageState.siz"
      :page-provider="pageProvider"
      :page-mode="pageMode"
      style="align-self: center"
      :style="gridStyle"
      @current-changed="currentChanged"
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
import { computed, reactive, ref } from 'vue'
import { localOrRemoteUrl } from '@/utils/query'
import useLayoutSize from '@/hooks/use-layout-size'
import FdVirtualGrid from '@/components/virtual-grid/virtual-grid.vue'
import { Indexable } from '@/common/types'

defineOptions({
  name: 'DemoVirtualGrid'
})

const virtualGrid = ref<InstanceType<typeof FdVirtualGrid>>()
const actRef = ref<HTMLElement>()
const length = ref<number>(200)
const pageMode = ref<boolean>(false)
const scrollIdx = ref<number | undefined>(undefined)

const scrollToIdx = () => {
  virtualGrid.value.scrollToIdx(scrollIdx.value)
}

const { docHeight, docMinHeight, showPageHeader, auth } = usePage({ footerVisible: false })

const pageStyle = computed(() => {
  if (pageMode.value) {
    return docMinHeight.value
  }
  return docHeight.value
})

const wrapperW = ref<number | undefined>(undefined)

const gridStyle = computed(() => {
  const style = {} as Indexable
  if (wrapperW.value) {
    style.width = `${wrapperW.value}px`
  }
  return style
})

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

const togglePageMode = () => {
  pageMode.value = !pageMode.value
}

const pageState = reactive({
  current: 1,
  count: 0,
  siz: 40,
  total: 0
})

const provider = async (pageNumber: number, pageSize: number) => {
  const { data, total, count } = await fileList({ current: pageNumber, size: pageSize })
  if (total && count) {
    pageState.total = total as number
    pageState.count = count
    length.value = total
  }
  return data
}
const pageProvider = computed(() => {
  return provider
})

const { isMobile } = useLayoutSize()

const pageChange = (val: number) => {
  pageState.current = val
  virtualGrid.value.scrollToIdx((val - 1) * pageState.siz)
}

const sizeChange = async (val: number) => {
  pageState.siz = val
  pageState.count = Math.ceil(pageState.total / val)
}

const currentChanged = (index: number, page: number) => {
  pageState.current = page
}

const paginationAttrs = computed(() => {
  return {
    background: 'background',
    small: true,
    currentPage: pageState.current,
    pageCount: pageState.count,
    pageSize: pageState.siz,
    pageSizes: [10, 15, 20, 50, 100, 200],
    total: pageState.total,
    layout: isMobile.value ? 'prev, pager, next' : 'total, sizes, prev, pager, next',
    onCurrentChange: pageChange,
    onSizeChange: sizeChange
  }
})
</script>

<style lang="scss" scoped>
.fd-virtual-grid {
  flex: 1;
}

.fd-page-toolbar__left {
  justify-content: center;
  .el-input {
    margin-right: 16px;
  }
}

.fd-page-toolbar__center {
  justify-content: center;
  .el-pagination {
    padding: 0;
    margin: 0 16px;
  }
}
</style>
