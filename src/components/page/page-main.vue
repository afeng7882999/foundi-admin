<template>
  <div :style="docMinHeight" :class="`page-${name} fd-page`">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <fd-split-pane v-model:shrink-all.not="queryFormShowCo" :default-pos="280" shrink="right" :shrink-to-hide="true">
      <template #left>
        <slot name="query" />
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
</template>

<script lang="ts">
export default {
  name: 'FdPageMain'
}
</script>

<script setup lang="ts">
import usePage from '@/components/page/use-page'
import FdSplitPane from '@/components/split-pane/index.vue'
import { computed } from 'vue'

const props = defineProps({
  name: String,
  queryFormShow: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:queryFormShow'])
const queryFormShowCo = computed({
  get: () => {
    return props.queryFormShow
  },
  set: (val) => {
    emit('update:queryFormShow', val)
  }
})

const { docMinHeight, showPageHeader } = usePage()
</script>
