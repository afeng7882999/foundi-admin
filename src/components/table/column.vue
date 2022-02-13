<template>
  <template v-if="visible">
    <!-- default -->
    <el-table-column
      v-if="typ === 'default'"
      v-bind="$attrs"
      :show-overflow-tooltip="showOverflowTooltip"
      :align="align"
      :header-align="headerAlign"
      :width="width"
      :label-class-name="sortable ? 'is-custom' : ''"
    >
      <template v-if="sortable" #header="scope">
        <fd-table-sort-header :column="scope.column" @sort-changed="onSortChanged"></fd-table-sort-header>
      </template>
    </el-table-column>
    <!-- custom -->
    <el-table-column
      v-if="typ === 'custom'"
      v-bind="$attrs"
      :show-overflow-tooltip="showOverflowTooltip"
      :align="align"
      :header-align="headerAlign"
      :width="width"
      :label-class-name="sortable ? 'is-custom' : ''"
    >
      <template #default="scope">
        <slot :row="scope.row" :idx="scope.$index"></slot>
      </template>
      <template v-if="sortable" #header="scope">
        <fd-table-sort-header :column="scope.column" @sort-changed="onSortChanged"></fd-table-sort-header>
      </template>
    </el-table-column>
    <!-- selection -->
    <el-table-column
      v-else-if="typ === 'selection'"
      v-bind="$attrs"
      :align="align"
      :header-align="headerAlign"
      type="selection"
      width="40"
    ></el-table-column>
    <!-- datetime -->
    <el-table-column
      v-else-if="typ === 'datetime'"
      v-bind="$attrs"
      :align="align"
      :header-align="headerAlign"
      :width="widthCo"
      :label-class-name="sortable ? 'is-custom' : ''"
    >
      <template #default="scope">
        <span>{{ formatTimestamp(scope.row.operTime) }}</span>
      </template>
      <template v-if="sortable" #header="scope">
        <fd-table-sort-header :column="scope.column" @sort-changed="onSortChanged"></fd-table-sort-header>
      </template>
    </el-table-column>
    <!-- dictionary -->
    <el-table-column
      v-else-if="typ === 'dict'"
      v-bind="$attrs"
      :align="align"
      :header-align="headerAlign"
      :width="widthCo"
      :label-class-name="sortable ? 'is-custom' : ''"
    >
      <template #default="scope">
        <span>{{ dictVal(dict, scope.row[attrs.prop]) }}</span>
      </template>
      <template v-if="sortable" #header="scope">
        <fd-table-sort-header :column="scope.column" @sort-changed="onSortChanged"></fd-table-sort-header>
      </template>
    </el-table-column>
    <!-- icon -->
    <el-table-column v-else-if="typ === 'icon'" v-bind="$attrs" :align="align" :header-align="headerAlign" :width="widthCo">
      <template #default="scope">
        <fd-icon :icon="scope.row[attrs.prop]" class="fd-tb-icon"></fd-icon>
      </template>
    </el-table-column>
    <!-- action -->
    <el-table-column
      v-else-if="typ === 'act'"
      v-bind="$attrs"
      :align="align"
      fixed="right"
      :header-align="headerAlign"
      label="操作"
      :width="widthCo"
    >
      <template #default="scope">
        <slot name="prefix" :row="scope.row" :idx="scope.$index"></slot>
        <el-tooltip :show-after="500" content="详细" placement="top">
          <el-button
            v-show="detailVisible"
            class="fd-tb-act fd-tb-act-detail"
            plain
            size="mini"
            type="primary"
            @click="actionEmit('detail', scope.row, scope.$index)"
          >
            <fd-icon icon="view-grid-detail"></fd-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :show-after="500" content="编辑" placement="top">
          <el-button
            v-show="editVisible"
            class="fd-tb-act"
            plain
            size="mini"
            type="success"
            @click="actionEmit('edit', scope.row, scope.$index)"
          >
            <fd-icon icon="write"></fd-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :show-after="500" content="删除" placement="top">
          <el-button
            v-show="delVisible"
            class="fd-tb-act"
            plain
            size="mini"
            type="danger"
            @click="actionEmit('del', scope.row, scope.$index)"
          >
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
  name: 'FdColumn',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, PropType, useAttrs } from 'vue'
import { formatTimestamp } from '@/utils/time'
import { ColType } from './types'
import { IDictItem } from '@/api/system/dict-item'
import useDict from '@/components/crud/use-dict'
import usePage from '@/components/crud/use-page'
import { AnyObject } from '@/utils'

const props = defineProps({
  typ: {
    type: String as PropType<ColType>,
    default: 'default'
  },
  showOverflowTooltip: {
    type: Boolean,
    default: true
  },
  align: {
    type: String,
    default: 'left'
  },
  headerAlign: {
    type: String,
    default: 'left'
  },
  width: {
    type: String,
    default: ''
  },
  auth: String,
  dict: {
    type: Array,
    default: () => [] as IDictItem[]
  },
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
  sortable: {
    type: Boolean,
    default: false
  },
  onSortChanged: Function
})

const emit = defineEmits(['detail', 'edit', 'del'])

const attrs = useAttrs()

const { dictVal } = useDict()
const { hasAuth } = usePage()

const visible = computed(() => {
  if (props.auth) {
    return hasAuth(props.auth)
  }
  return true
})

const widthCo = computed(() => {
  if (props.width) {
    return props.width
  }
  if (props.typ === 'datetime') {
    return '200'
  }
  if (props.typ === 'dict') {
    return '150'
  }
  if (props.typ === 'act') {
    return '130'
  }
  if (props.typ === 'icon') {
    return '80'
  }
  return ''
})

const detailVisible = computed(() => {
  if (typeof props.detail === 'boolean') {
    return props.detail
  }
  if (props.detail) {
    return hasAuth(props.detail)
  }
  return true
})

const editVisible = computed(() => {
  if (typeof props.edit === 'boolean') {
    return props.edit
  }
  if (props.edit) {
    return hasAuth(props.edit)
  }
  return true
})

const delVisible = computed(() => {
  if (typeof props.del === 'boolean') {
    return props.del
  }
  if (props.del) {
    return hasAuth(props.del)
  }
  return true
})

const actionEmit = (event: 'detail' | 'edit' | 'del', row: AnyObject, idx: number) => {
  emit(event, row, idx)
}
</script>
