<template>
  <template v-if="visibleCo">
    <div class="fd-page__form fd-page-query">
      <div class="fd-page__sub-title"><span class="title-text">查询</span></div>
      <el-form ref="queryForm" :model="state.data" label-position="top" @keyup.enter="onQuery">
        <el-scrollbar class="fd-page-query__scrollbar" :style="scrollbarStyle">
          <slot />
        </el-scrollbar>
        <fd-fmi-act @query="onQuery" @reset="reset" />
      </el-form>
    </div>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdPageQuery',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, PropType, reactive, ref, toRaw, watch } from 'vue'
import usePage from '@/extend/page/use-page'
import { cloneDeep } from 'lodash-es'
import { ApiQueryWithOrder } from '@/extend/crud/use-list'

const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  queryData: Object as PropType<ApiQueryWithOrder>,
  queryFn: Function,
  resetFn: Function
})

const state = reactive({
  data: props.queryData as ApiQueryWithOrder | undefined
})

const visibleCo = computed(() => {
  return props.visible
})

watch(
  () => props.queryData,
  (val) => {
    state.data = cloneDeep(toRaw(val))
  },
  { immediate: true, deep: true }
)

const emit = defineEmits(['update:queryData'])
const onQuery = () => {
  emit('update:queryData', state.data)
  props.queryFn?.()
}

const queryForm = ref()
const reset = () => {
  queryForm.value.resetFields()
  emit('update:queryData', state.data)
  props.resetFn?.()
}

const { getDocHeightNoHeaderFooter } = usePage()
const scrollbarStyle = computed(() => {
  return {
    maxHeight: getDocHeightNoHeaderFooter(128, 'px')
  }
})
</script>
