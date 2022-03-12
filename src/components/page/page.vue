<template>
  <div :style="docMinHeight" :class="`page-${name} fd-page`">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <fd-split-pane v-model:shrink-all.not="queryVisibleCo" :default-pos="280" shrink="right" :shrink-to-hide="true">
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
  <fd-page-footer :visible="footerVisible"></fd-page-footer>
</template>

<script lang="ts">
export default {
  name: 'FdPage'
}
</script>

<script setup lang="ts">
import usePage from '@/components/page/use-page'
import FdSplitPane from '@/components/split-pane/index.vue'
import { computed } from 'vue'

const props = defineProps({
  name: String,
  queryVisible: {
    type: Boolean,
    default: false
  },
  footerVisible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:queryVisible'])
const queryVisibleCo = computed({
  get: () => {
    return props.queryVisible
  },
  set: (val) => {
    emit('update:queryVisible', val)
  }
})

const { docMinHeight, showPageHeader } = usePage()
</script>
