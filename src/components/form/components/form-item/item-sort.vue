<template>
  <template v-if="visibleCo">
    <el-form-item :label="label" class="fd-item-sort">
      <div ref="itemWrapper" class="fd-item-sort__wrapper">
        <div v-for="item in state.data" :key="item.prop" class="fd-item-sort__item">
          <el-tooltip content="拖动排序字段" :disabled="disabled" :show-after="500" placement="top">
            <div class="fd-item-sort__drag sortable-drag">
              <fd-icon icon="drag"></fd-icon>
            </div>
          </el-tooltip>
          <el-select v-model="item.prop" clearable :disabled="disabled" @change="changeField" @clear="removeField(item)">
            <el-option v-for="field in getFields(item)" :key="field.name" :label="field.comment" :value="field.name"></el-option>
          </el-select>
          <el-tooltip
            :content="item.order === 'asc' ? '点击切换升序' : '点击切换降序'"
            :disabled="disabled"
            :show-after="500"
            placement="top"
          >
            <fd-icon-button
              class="fd-item-sort__toggle"
              :icon="item.order === 'asc' ? 'up-small' : 'down-small'"
              :disabled="disabled"
              @click="toggleOrder(item)"
            ></fd-icon-button>
          </el-tooltip>
        </div>
      </div>
      <div class="fd-item-sort__item">
        <div>
          <fd-icon icon="plus" class="fd-item-sort__drag"></fd-icon>
        </div>
        <el-select
          style="width: 100%; margin-right: 36px"
          :disabled="disabled"
          :placeholder="placeholder"
          no-data-text="无可排序字段"
          @change="addField"
        >
          <el-option v-for="field in getFields()" :key="field.name" :label="field.comment" :value="field.name"></el-option>
        </el-select>
      </div>
    </el-form-item>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdItemSort'
}
</script>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, PropType, reactive, ref, watch } from 'vue'
import { SortFieldResult } from '@/components/form/type'
import { SortField } from '@/api'
import FdIconButton from '@/components/icon-button/icon-button.vue'
import Sortable, { SortableEvent } from 'sortablejs'

const props = defineProps({
  label: {
    type: String,
    default: '排序'
  },
  modelValue: {
    type: Array as PropType<SortFieldResult[]>,
    default: () => []
  },
  fields: {
    type: Array as PropType<SortField[]>,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '添加排序字段'
  },
  visible: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const state = reactive({
  data: [] as SortFieldResult[]
})

const visibleCo = computed(() => {
  return props.visible
})

const getFields = (self?: SortFieldResult) => {
  if (self) {
    return props.fields?.filter((f) => state.data.findIndex((d) => d.prop === f.name) === -1 || f.name === self.prop)
  }
  return props.fields?.filter((f) => state.data.findIndex((d) => d.prop === f.name) === -1)
}

const addField = (val: string) => {
  const add = props.fields?.find((f) => f.name === val)
  if (add) {
    state.data.push({ prop: add.name, comment: add.comment, order: 'asc' })
    returnValue()
  }
}

const changeField = (val: string) => {
  const changed = state.data.find((d) => d.prop === val)
  const field = props.fields.find((f) => f.name === val)
  if (changed && field) {
    changed.comment = field.comment
    returnValue()
  }
}

const removeField = (val: SortFieldResult) => {
  state.data = state.data.filter((d) => d.prop !== val.prop)
  returnValue()
}

const toggleOrder = (item: SortFieldResult) => {
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

watch(
  () => props.modelValue,
  (val) => {
    state.data = [] as SortFieldResult[]
    if (val?.length) {
      val.forEach((d) => {
        const idx = ['asc', 'desc'].findIndex((s) => s === d.order)
        if (idx !== -1) {
          const field = props.fields?.find((f) => f.name === d.prop)
          if (field) {
            state.data.push({ prop: field.name, comment: field.comment, order: idx === 0 ? 'asc' : 'desc' })
          }
        }
      })
    }
  },
  { immediate: true }
)

const emit = defineEmits(['update:modelValue'])
const returnValue = () => {
  emit('update:modelValue', state.data)
}
</script>

<style lang="scss">
.fd-item-sort {
  &__drag {
    color: var(--el-text-color-placeholder);
    margin-right: 4px;
  }
  &__item {
    display: flex;
    flex-flow: row;
    align-items: center;
    margin-bottom: 8px;
    .el-select {
      flex: 1;
    }
  }
  &__toggle {
    margin-left: 4px;
  }
  .sortable-chosen {
    .el-input .el-input__inner {
      border: none;
      background: none;
    }
  }
}
</style>
