<template>
  <div class="fd-page" :style="gridView ? docHeight : docMinHeight" :class="objClass">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <template v-if="!hasQuery">
      <slot name="act" />
      <slot v-if="gridView" name="grid" />
      <div v-else ref="tableWrapper" class="fd-page__table is-bordered">
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
          <el-form ref="queryForm" :model="state.data" label-position="top" @keyup.enter="onQuery">
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
        <div v-else ref="tableWrapper" class="fd-page__table is-bordered">
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
import usePage from '../hooks/use-page'
import FdSplitPane from '@/components/split-pane/index.vue'
import { computed, PropType, reactive, ref, toRaw, useSlots, watch } from 'vue'
import { cloneDeep } from 'lodash-es'
import { ApiQuery } from '@/api'
import { sizeConst } from '@/hooks/use-layout-size'

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

const state = reactive({
  data: props.queryData as ApiQuery | undefined
})

watch(
  () => props.queryData,
  (val) => {
    state.data = cloneDeep(toRaw(val))
  },
  { immediate: true, deep: true }
)

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
  emit('update:queryData', state.data)
  props.queryFn?.()
}
const reset = () => {
  queryForm.value.resetFields()
  state.data && (state.data.sort = [])
  drawer.value?.hide()
  emit('update:queryData', state.data)
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
  const remove = props.footerVisible ? 86 + sizeConst.footerHeight : 86
  return {
    height: getDocHeightNoHeaderFooter(remove, 'px')
  }
})
</script>
