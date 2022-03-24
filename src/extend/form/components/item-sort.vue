<template>
  <template v-if="visibleCo">
    <el-form-item v-bind="$attrs" :label="label" class="fd-fmi-sort">
      <template #label>
        <div class="fd-fmi-sort__label">
          <span>{{ label }}</span>
          <el-tooltip content="添加排序字段" :disabled="disabled" :show-after="500" placement="top">
            <el-button type="text" :disabled="addDisabled" @click="addField">
              <fd-icon icon="plus" class="is-in-btn"></fd-icon>
              添加
            </el-button>
          </el-tooltip>
        </div>
      </template>
      <div ref="itemWrapper" class="fd-fmi-sort__wrapper">
        <div v-for="item in state.data" :key="item.prop" class="fd-fmi-sort__item">
          <el-tooltip content="拖动排序字段" :disabled="disabled" :show-after="500" placement="left">
            <div class="fd-fmi-sort__drag sortable-drag">
              <fd-icon icon="drag"></fd-icon>
            </div>
          </el-tooltip>
          <el-select v-model="item.prop" clearable :disabled="disabled" @change="changeField" @clear="removeField(item)">
            <el-option v-for="field in getFields(item)" :key="field.prop" :label="field.comment" :value="field.prop"></el-option>
          </el-select>
          <el-tooltip
            :content="item.order === 'asc' ? '点击切换升序' : '点击切换降序'"
            :disabled="disabled"
            :show-after="500"
            placement="top"
          >
            <fd-icon-button
              class="fd-fmi-sort__toggle"
              :icon="item.order === 'asc' ? 'up-small' : 'down-small'"
              :disabled="disabled"
              @click="toggleOrder(item)"
            ></fd-icon-button>
          </el-tooltip>
        </div>
      </div>
    </el-form-item>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdFmiSort'
}
</script>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, PropType, reactive, ref, watch } from 'vue'
import { FORM_ITEM_DEFAULT_PROPS } from '@/extend/form/type'
import { SortField } from '@/api'
import FdIconButton from '@/components/icon-button/icon-button.vue'
import Sortable, { SortableEvent } from 'sortablejs'
import useFormItem from '@/extend/form/hooks/use-form-item'

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS,
  prop: {
    type: String,
    default: 'sort'
  },
  label: {
    type: String,
    default: '排序'
  },
  modelValue: {
    type: Array as PropType<SortField[]>,
    default: () => []
  },
  fields: {
    type: Array as PropType<SortField[]>,
    default: () => []
  }
})

const state = reactive({
  data: [] as SortField[]
})

const visibleCo = computed(() => {
  return props.visible
})

const addDisabled = computed(() => {
  return props.disabled || getNotSortFields().length <= 0
})

const getFields = (self?: SortField) => {
  if (self) {
    return props.fields?.filter((f) => state.data.findIndex((d) => d.prop === f.prop) === -1 || f.prop === self.prop)
  }
  return getNotSortFields()
}

const getNotSortFields = () => {
  return props.fields?.filter((f) => state.data.findIndex((d) => d.prop === f.prop) === -1)
}

const addField = () => {
  const empty = state.data?.find((d) => d.prop === '')
  if (!empty && getNotSortFields().length > 0) {
    state.data.push({ prop: '', comment: '', order: 'asc' })
  }
}

const changeField = (val: string) => {
  const changed = state.data.find((d) => d.prop === val)
  const field = props.fields.find((f) => f.prop === val)
  if (changed && field) {
    changed.comment = field.comment
    returnValue()
  }
}

const removeField = (val: SortField) => {
  state.data = state.data.filter((d) => d.prop !== val.prop)
  returnValue()
}

const toggleOrder = (item: SortField) => {
  item.order = item.order === 'asc' ? 'desc' : 'asc'
  returnValue()
}

const onSortEnd = (e: SortableEvent) => {
  if (state.data?.length) {
    const target = state.data.splice(e.oldIndex as number, 1)[0]
    state.data.splice(e.newIndex as number, 0, target)
    returnValue()
  }
}

const itemWrapper = ref()
let sortable = null as Sortable | null
const initDrag = () => {
  const el = itemWrapper.value as HTMLElement
  if (el) {
    sortable = Sortable.create(el, {
      handle: '.sortable-drag',
      chosenClass: 'sortable-chosen',
      animation: 150,
      onEnd: onSortEnd
    })
  }
}

onMounted(() => {
  initDrag()
})

onUnmounted(() => {
  sortable?.destroy()
})

watch(
  () => props.disabled,
  (val) => {
    if (val) {
      sortable?.option('disabled', true)
    } else {
      sortable?.option('disabled', false)
    }
  },
  { immediate: true }
)

const { model } = useFormItem(props)
watch(
  () => model()?.[props.prop],
  (val) => {
    state.data = [] as SortField[]
    const v = val as SortField[]
    if (v.length) {
      v.forEach((s) => {
        if (s) {
          const field = props.fields?.find((f) => f.prop === s.prop)
          if (field) {
            state.data.push({ prop: field.prop, comment: field.comment, order: s.order })
          }
        }
      })
    }
  },
  { immediate: true, deep: true }
)

const returnValue = () => {
  const m = model()
  m && (m[props.prop] = state.data)
}
</script>
