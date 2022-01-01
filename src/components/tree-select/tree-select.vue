<template>
  <div :id="state.treeSelectId" ref="treeSelect" class="fd-tree-select">
    <el-popover
      v-model:visible="state.visible"
      popper-class="fd-tree-select__popper"
      :disabled="disabled"
      :placement="placement"
      :show-arrow="true"
      trigger="click"
      @hide="onPopoverHide"
    >
      <template #reference>
        <el-select
          v-bind="selectParamsCo"
          ref="selectCom"
          v-model="state.labels"
          class="fd-tree-select__select"
          popper-class="fd-tree-select__option"
          :style="styles"
          :disabled="disabled"
          :filterable="false"
          :popper-append-to-body="false"
          @clear="onSelectClear"
          @focus="onPopoverShow"
          @remove-tag="onRemoveTag"
        ></el-select>
      </template>
      <el-input
        v-if="treeParamsCo.filterable"
        v-model="state.keywords"
        class="fd-tree-select__filter"
        size="mini"
        @change="onFilterChange"
      >
        <template #append>
          <el-button icon="el-icon-search"></el-button>
        </template>
      </el-input>
      <el-scrollbar class="fd-tree-select__tree">
        <el-tree
          v-show="state.data.length > 0"
          v-bind="treeParamsCo"
          ref="treeCom"
          :current-node-key="state.ids && state.ids.length > 0 ? state.ids[0] : '0'"
          :data="state.data"
          :draggable="false"
          :filter-node-method="filter"
          node-key="id"
          :show-checkbox="selectParamsCo.multiple"
          :expand-on-click-node="true"
          :highlight-current="true"
          @check="onTreeCheck"
          @node-click="onTreeNodeClick"
        ></el-tree>
        <div v-if="state.data.length === 0" class="fd-tree-select__no-data">暂无数据</div>
      </el-scrollbar>
    </el-popover>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdTreeSelect'
}
</script>

<script setup lang="ts">
import { ITreeFields, ITreeNode, traverseTree } from '@/utils/data-tree'
import { nextFrame } from '@/utils/next-frame'
import { off, on } from '@/utils/dom'
import { generateId } from '@/utils/lang'
import { merge } from 'lodash-es'
import { computed, nextTick, onBeforeMount, onBeforeUnmount, onMounted, PropType, reactive, ref, watch } from 'vue'
import { DEFAULT_SELECT_PARAMS, DEFAULT_TREE_FIELDS, DEFAULT_TREE_PARAMS } from '@/components/tree-select/types'

const props = defineProps({
  dataList: {
    type: Array as PropType<ITreeNode[]>,
    default: () => []
  },
  modelValue: {
    type: [String, Array] as PropType<string | string[]>,
    default: ''
  },
  styles: {
    type: Object
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placement: {
    type: String,
    default: 'bottom'
  },
  selectParams: {
    type: Object
  },
  treeParams: {
    type: Object
  },
  treeFields: {
    type: Object as PropType<ITreeFields>,
    default: () => DEFAULT_TREE_FIELDS
  }
})

const emit = defineEmits(['tree-search', 'node-click', 'node-check', 'select-clear', 'update:modelValue'])

const treeSelect = ref<HTMLElement | null>(null)
const treeCom = ref()
const selectCom = ref()

const state = reactive({
  treeSelectId: 'fd-tree-select-',
  popoverElId: '',
  data: props.dataList as ITreeNode[],
  keywords: '',
  labels: '' as string | string[],
  ids: [] as string[],
  visible: false,
  width: 150
})

const selectEl = computed(() => {
  return (treeSelect.value as HTMLElement).firstElementChild as HTMLElement
})

const selectParamsCo = computed(() => {
  if (props.selectParams) {
    return merge({}, DEFAULT_SELECT_PARAMS, props.selectParams)
  } else {
    return merge({}, DEFAULT_SELECT_PARAMS)
  }
})

const treeFieldsCo = computed<ITreeFields>(() => {
  if (props.treeFields) {
    return merge({}, DEFAULT_TREE_FIELDS, props.treeFields)
  } else {
    return merge({}, DEFAULT_TREE_FIELDS)
  }
})

const treeParamsCo = computed(() => {
  const { idField, labelField, childrenField, disabledField } = treeFieldsCo.value
  const paramsWithProps = {
    nodeKey: idField,
    props: { label: labelField, children: childrenField, disabled: disabledField }
  }

  if (props.treeParams) {
    return merge(DEFAULT_TREE_PARAMS, props.treeParams, paramsWithProps)
  } else {
    return merge({}, DEFAULT_TREE_PARAMS, paramsWithProps)
  }
})

watch(
  () => props.dataList,
  (val) => {
    treeDataUpdate(val)
  },
  { flush: 'post' }
)

watch(
  () => state.ids,
  (val) => {
    if (val) {
      setSelectNode(val)
    }
  },
  { flush: 'post' }
)

watch(
  () => props.modelValue,
  (val) => {
    const { multiple } = selectParamsCo.value
    if (val) {
      if (multiple) {
        state.ids = typeof val === 'string' ? [val] : val
      } else {
        state.ids = val === '' ? [] : [val as string]
      }
    } else {
      state.ids = []
    }
  }
)

onBeforeMount(() => {
  state.treeSelectId = state.treeSelectId + generateId()
  const { multiple } = selectParamsCo.value
  state.ids = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
  state.labels = multiple ? [] : ''
})

onMounted(() => {
  state.popoverElId = selectEl.value.getAttribute('ariadescribedby') as string
  updateH()
  nextTick(() => {
    on(document, 'mouseup', popoverHide)
  })
})

onBeforeUnmount(() => {
  off(document, 'mouseup', popoverHide)
})

const onFilterChange = () => {
  ;(treeCom.value as any).filter(state.keywords)
  emit('tree-search', state.keywords)
}

const setSelectNode = (ids: string[]) => {
  const { multiple } = selectParamsCo.value
  if (!ids || ids.length === 0 || state.data.length === 0) {
    state.labels = multiple ? [] : ''
    if (multiple) {
      ;(treeCom.value as any).setCheckedKeys([])
    } else {
      ;(treeCom.value as any).setCurrentKey('')
    }
    return
  }
  if (multiple) {
    ;(treeCom.value as any).setCheckedKeys(ids)
    state.labels =
      (treeCom.value as any).getCheckedNodes().map((item: ITreeNode) => item[treeFieldsCo.value.labelField]) || []
  } else {
    ;(treeCom.value as any).setCurrentKey(ids[0])
    if ((treeCom.value as any).getCurrentNode()) {
      state.labels = (treeCom.value as any).getCurrentNode()[treeFieldsCo.value.labelField]
    } else {
      state.labels = ''
    }
  }
}

const filter = (value: string, data: ITreeNode) => {
  if (!value) return true
  return data[treeFieldsCo.value.labelField].indexOf(value) !== -1
}

const onTreeNodeClick = (data: ITreeNode, node: any, com: any) => {
  const { multiple } = selectParamsCo.value
  const { clickParent } = treeParamsCo.value
  const { idField, childrenField, disabledField } = treeFieldsCo.value
  if (data[disabledField]) {
    return
  }
  if (node.checked) {
    const value = data[idField as string]
    state.ids = state.ids.filter((id) => id !== value)
  } else {
    if (!multiple) {
      if (!clickParent) {
        const children = data[childrenField as string]
        if (!children || children.length === 0) {
          state.ids = [data[idField as string]]
          state.visible = false
        } else {
          return false
        }
      } else {
        state.ids = [data[idField as string]]
        state.visible = false
      }
    } else {
      state.ids.push(data[idField as string])
    }
  }
  emitValue()
  emit('node-click', data, node, com)
}

const onTreeCheck = (data: ITreeNode, node: any, com: any) => {
  state.ids = []
  const { idField } = treeFieldsCo.value
  node.checkedNodes.forEach((item: ITreeNode) => {
    state.ids.push(item[idField as string])
  })
  emit('node-check', data, node, com)
  emitValue()
}

const onRemoveTag = (tag: string) => {
  const { data } = state
  const { idField, labelField, childrenField } = treeFieldsCo.value
  traverseTree(
    data,
    (item) => {
      if (item[labelField] === tag) {
        const value = item[idField as string]
        state.ids = state.ids.filter((id) => id !== value)
      }
    },
    {
      childrenField: childrenField
    }
  )
  ;(treeCom.value as any).setCheckedKeys(state.ids)
  emitValue()
}

const onSelectClear = () => {
  state.ids = []
  const { multiple } = selectParamsCo.value
  emit('update:modelValue', multiple ? [] : '')
  emit('select-clear')
}

const emitValue = () => {
  const { multiple } = selectParamsCo.value
  emit('update:modelValue', multiple ? state.ids : state.ids.length > 0 ? state.ids[0] : '')
}

const updateH = () => {
  nextTick(() => {
    const $selectEl = selectEl.value
    state.width = $selectEl.getBoundingClientRect().width
    const $popper = document.getElementById(state.popoverElId) as HTMLElement
    if ($popper) {
      $popper.style.minWidth = state.width + 'px'
    }
  })
}

const onPopoverShow = () => {
  updateH()
}

const popoverHide = (e: Event) => {
  const isInter = e.composedPath().some((item) => {
    const elementId = (item as HTMLElement).id
    return !!elementId && (elementId === state.treeSelectId || elementId === state.popoverElId)
  })
  if (!isInter) {
    state.visible = false
  }
}

const treeDataUpdate = (data: ITreeNode[]) => {
  state.data = data
  nextFrame(() => {
    setSelectNode(state.ids)
  })
}

const onPopoverHide = () => {
  ;(selectCom.value as any).blur()
}
</script>

<style lang="scss">
.fd-tree-select {
  &__select {
    width: 100%;
  }

  &__option {
    display: none !important;
  }

  &__popper {
    width: auto !important;
    max-height: 280px;
    padding: 5px 0 5px 0 !important;
    /*overflow: hidden;*/

    &[x-placement^='bottom'] {
      margin-top: 5px;
    }

    &[x-placement^='top'] {
      margin-bottom: 5px;
    }
  }

  &__tree {
    .el-scrollbar__wrap {
      max-height: 260px;
    }

    .el-tree {
      .el-tree-node {
        &__content {
          height: 34px;
          padding-right: 20px;
        }
      }
    }
  }

  &__filter {
    padding: 0 10px 0 10px;
    margin-bottom: 10px;
  }

  &__no-data {
    height: 32px;
    line-height: 32px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
}
</style>
