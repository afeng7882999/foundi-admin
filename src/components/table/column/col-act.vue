<template>
  <template v-if="visible && !isMobile">
    <el-table-column
      v-bind="$attrs"
      :align="align"
      fixed="right"
      :header-align="headerAlign"
      label="操作"
      :width="widthCo"
      :min-width="minWidth"
    >
      <template #default="scope">
        <slot name="prefix" :row="scope.row" :idx="scope.$index"></slot>
        <el-tooltip v-if="detailVisible" :show-after="500" content="详细" placement="top">
          <fd-button class="tb-act-btn" icon="view-list" plain color="primary" @click="emitDetail(scope.$index)" />
        </el-tooltip>
        <el-tooltip v-if="editVisible" :show-after="500" content="编辑" placement="top">
          <fd-button class="tb-act-btn" icon="write" plain color="success" @click="emitEdit(scope.row)" />
        </el-tooltip>
        <el-tooltip v-if="delVisible" :show-after="500" content="删除" placement="top">
          <fd-button class="tb-act-btn" icon="close" plain color="danger" @click="emitDel(scope.row)" />
        </el-tooltip>
        <slot name="append" :row="scope.row" :idx="scope.$index"></slot>
      </template>
    </el-table-column>
  </template>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { Indexable } from '@/common/types'
import { COL_DEFAULT_PROPS } from '../types'
import useColumn from '../hooks/use-column'
import useLayoutSize from '@/hooks/use-layout-size'

defineOptions({
  name: 'FdColAct',
  inheritAttrs: false
})

const props = defineProps({
  ...COL_DEFAULT_PROPS,
  detail: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  edit: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  del: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  align: {
    type: String,
    default: 'center'
  },
  headerAlign: {
    type: String,
    default: 'center'
  },
  mobileCompact: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['detail', 'edit', 'del'])

const { visible, booleanOrAuth } = useColumn(props)

const { isMobile } = useLayoutSize(props.mobileCompact)

const widthCo = computed(() => {
  if (props.width) {
    return props.width
  }
  return '130'
})

const detailVisible = computed(() => {
  return booleanOrAuth(props.detail)
})

const editVisible = computed(() => {
  return booleanOrAuth(props.edit)
})

const delVisible = computed(() => {
  return booleanOrAuth(props.del)
})

const emitDetail = (idx: number) => {
  emit('detail', idx)
}

const emitEdit = (row: Indexable) => {
  emit('edit', row)
}

const emitDel = (row: Indexable) => {
  emit('del', row)
}
</script>
