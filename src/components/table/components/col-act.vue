<template>
  <template v-if="visible">
    <el-table-column v-bind="$attrs" :align="align" fixed="right" :header-align="headerAlign" label="操作" :width="widthCo">
      <template #default="scope">
        <slot name="prefix" :row="scope.row" :idx="scope.$index"></slot>
        <el-tooltip v-if="detailVisible" :show-after="500" content="详细" placement="top">
          <el-button class="tb-act-btn" plain type="primary" @click="actionEmit('detail', scope.row, scope.$index)">
            <fd-icon icon="view-grid-detail"></fd-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="editVisible" :show-after="500" content="编辑" placement="top">
          <el-button class="tb-act-btn" plain type="success" @click="actionEmit('edit', scope.row, scope.$index)">
            <fd-icon icon="write"></fd-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="delVisible" :show-after="500" content="删除" placement="top">
          <el-button class="tb-act-btn" plain type="danger" @click="actionEmit('del', scope.row, scope.$index)">
            <fd-icon icon="close"></fd-icon>
          </el-button>
        </el-tooltip>
        <slot name="append" :row="scope.row" :idx="scope.$index"></slot>
      </template>
    </el-table-column>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdColAct',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { Indexable } from '@/app/types'
import { COL_DEFAULT_PROPS } from '@/components/table/types'
import useColumn from '@/components/table/hooks/use-column'

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
  }
})

const emit = defineEmits(['detail', 'edit', 'del'])

const { visible, booleanOrAuth } = useColumn(props)

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

const actionEmit = (event: 'detail' | 'edit' | 'del', row: Indexable, idx: number) => {
  emit(event, row, idx)
}
</script>
