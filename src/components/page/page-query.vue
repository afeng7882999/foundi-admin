<template>
  <template v-if="visibleCo">
    <div class="fd-page__form fd-page-query">
      <div class="fd-page__sub-title"><span class="title-text">查询</span></div>
      <el-form ref="queryForm" :model="queryData" label-position="top" @keyup.enter="queryFn">
        <el-scrollbar class="fd-page-query__scrollbar" :style="scrollbarStyle">
          <slot />
        </el-scrollbar>
        <fd-item-act @query="queryFn" @reset="reset" />
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
import { computed, PropType, ref } from 'vue'
import { ApiQuery } from '@/api'
import usePage from '@/components/page/use-page'

const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  queryData: Object as PropType<ApiQuery>,
  queryFn: Function,
  resetFn: Function
})

const queryForm = ref()

const visibleCo = computed(() => {
  return props.visible
})

const { getDocHeightNoHeader } = usePage()

const scrollbarStyle = computed(() => {
  return {
    maxHeight: getDocHeightNoHeader(128, 'px')
  }
})

const reset = () => {
  queryForm.value.resetFields()
  props.resetFn?.()
}
</script>

<style lang="scss">
.fd-page-query {
  padding: 16px 0;
  .fd-page__sub-title {
    margin: 0 16px 16px 16px;
  }
  &__scrollbar {
    padding: 0 16px;
  }
  .el-form-item {
    margin: 16px 0 8px 0;
  }
  .el-form-item__content {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
