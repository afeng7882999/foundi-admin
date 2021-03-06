<template>
  <div class="fd-page" :style="gridView ? docHeight : docMinHeight" :class="objClass">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <template v-if="!hasQuery">
      <slot name="act" />
      <slot v-if="gridView" name="grid" />
      <div v-else class="fd-page__table is-bordered">
        <slot name="table" />
        <el-pagination class="fd-pagination" v-bind="pagination"></el-pagination>
      </div>
    </template>
    <fd-split-pane
      v-else
      v-model:shrink-all.not="queryVisibleCo"
      class="fd-page__split-pane"
      :animation="false"
      :default-pos="280"
      shrink="right"
      :shrink-to-hide="true"
    >
      <template #left>
        <div class="fd-page__form fd-page-query">
          <div class="fd-page__sub-title"><span class="title-text">查询</span></div>
          <el-form ref="queryForm" :model="queryDataCo" label-position="top" @keyup.enter="onQuery">
            <el-scrollbar class="fd-page-query__scrollbar" :style="scrollbarStyle">
              <slot name="query" />
            </el-scrollbar>
            <el-form-item>
              <div class="fd-page-query__act">
                <el-button plain type="primary" @click="onQuery">
                  <fd-icon icon="search" class="is-in-btn"></fd-icon>
                  查询
                </el-button>
                <el-button @click="reset">
                  <fd-icon icon="refresh" class="is-in-btn"></fd-icon>
                  重置
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template #right>
        <slot name="act" />
        <slot v-if="gridView" name="grid" />
        <div v-else class="fd-page__table is-bordered">
          <slot name="table" />
          <el-pagination class="fd-pagination" v-bind="pagination"></el-pagination>
        </div>
      </template>
    </fd-split-pane>
    <el-backtop></el-backtop>
    <fd-page-footer :visible="!gridView && footerVisible"></fd-page-footer>
  </div>
</template>

<script setup lang="ts">
import usePage from '@/crud/hooks/use-page'
import FdSplitPane from '@b/components/split-pane/index.vue'
import { computed, PropType, ref, useSlots } from 'vue'
import { ApiQuery } from '@b/api'
import { LAYOUT_SIZES } from '@b/common/global'

defineOptions({
  name: 'FdPage'
})

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  queryVisible: {
    type: Boolean,
    default: false
  },
  footerVisible: {
    type: Boolean,
    default: true
  },
  queryData: Object as PropType<ApiQuery>,
  queryFn: Function,
  gridView: {
    type: Boolean,
    default: false
  },
  pagination: Object
})

let queryData = props.queryData as ApiQuery | undefined

const queryDataCo = computed({
  get: () => props.queryData,
  set: (val) => {
    queryData = val
  }
})

const objClass = computed(() => {
  const clazz = []
  clazz.push(`page-${props.name}`)
  return clazz.join(' ')
})

const hasQuery = computed(() => {
  return !!useSlots().query
})

const emit = defineEmits(['update:queryData', 'update:queryVisible'])

const queryForm = ref()
const drawer = ref()

const onQuery = () => {
  drawer.value?.hide()
  emit('update:queryData', queryData)
  props.queryFn?.()
}
const reset = () => {
  queryForm.value?.resetFields()
  queryData = {
    sort: []
  }
  drawer.value?.hide()
  emit('update:queryData', queryData)
  props.queryFn?.()
}

const queryVisibleCo = computed({
  get: () => {
    return props.queryVisible
  },
  set: (val) => {
    emit('update:queryVisible', val)
  }
})

const { docMinHeight, docHeight, showPageHeader, getDocHeightNoHeaderFooter } = usePage()

const scrollbarStyle = computed(() => {
  const remove = props.footerVisible ? 86 + LAYOUT_SIZES.footerHeight : 86
  return {
    height: getDocHeightNoHeaderFooter(remove, 'px')
  }
})
</script>
