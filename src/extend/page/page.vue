<template>
  <div :style="docMinHeight" :class="objClass">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <template v-if="isMobile">
      <fd-drawer
        v-if="isMobile"
        ref="drawer"
        v-model="queryVisibleCo"
        :close-on-click-modal="false"
        direction="ltr"
        :modal="false"
        title="查询"
      >
        <el-form ref="queryForm" :model="state.data" label-position="top" @keyup.enter="onQuery">
          <slot name="query" />
        </el-form>
        <template #footer>
          <el-button plain type="primary" @click="onQuery">
            <fd-icon icon="search" class="is-in-btn"></fd-icon>
            查询
          </el-button>
          <el-button @click="reset">
            <fd-icon icon="refresh" class="is-in-btn"></fd-icon>
            重置
          </el-button>
        </template>
      </fd-drawer>
      <div class="fd-page__form">
        <slot name="act" />
      </div>
      <div ref="tableWrapper" class="fd-page__table is-bordered">
        <slot name="table" />
      </div>
    </template>
    <fd-split-pane
      v-else
      v-model:shrink-all.not="queryVisibleCo"
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
              <el-button plain type="primary" @click="onQuery">
                <fd-icon icon="search" class="is-in-btn"></fd-icon>
                查询
              </el-button>
              <el-button @click="reset">
                <fd-icon icon="refresh" class="is-in-btn"></fd-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template #right>
        <div class="fd-page__form">
          <slot name="act" />
        </div>
        <div ref="tableWrapper" class="fd-page__table is-bordered">
          <slot name="table" />
        </div>
      </template>
    </fd-split-pane>
    <el-backtop></el-backtop>
  </div>
  <fd-page-footer :visible="footerVisible"></fd-page-footer>
</template>

<script lang="ts">
export default {
  name: 'FdPage'
}
</script>

<script setup lang="ts">
import usePage from '@/extend/page/use-page'
import FdSplitPane from '@/components/split-pane/index.vue'
import { computed, PropType, reactive, ref, toRaw, watch } from 'vue'
import useBreakpoint from '@/hooks/use-breakpoint'
import { cloneDeep } from 'lodash-es'
import { ApiQuery } from '@/api'
import { resizeConst } from '@/hooks/use-layout-resize'

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
  resetFn: Function
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

const { isMobile } = useBreakpoint()
const objClass = computed(() => {
  const clazz = [`page-${props.name} fd-page`]
  if (isMobile.value) {
    clazz.push('is-mobile')
  }
  return clazz
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
  drawer.value?.hide()
  emit('update:queryData', state.data)
  props.resetFn?.()
}

const queryVisibleCo = computed({
  get: () => {
    return props.queryVisible
  },
  set: (val) => {
    emit('update:queryVisible', val)
  }
})

const { docMinHeight, showPageHeader, getDocHeightNoHeaderFooter } = usePage()

const scrollbarStyle = computed(() => {
  const remove = props.footerVisible ? 86 + resizeConst.footerHeight : 86
  return {
    height: getDocHeightNoHeaderFooter(remove, 'px')
  }
})
</script>
