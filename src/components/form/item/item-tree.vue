<template>
  <el-form-item v-show="visibleCo" v-bind="$attrs" :class="itemClass" :label="label" :style="itemStyle" :prop="prop">
    <template #label>
      <span>
        {{ label }}
        <span v-if="tipIcon" class="tip-icon" @mouseenter="tipShow" @mouseleave="tipHide">
          <fd-icon icon="help" class="is-tip" />
        </span>
      </span>
    </template>
    <fd-tree-select
      v-model="model()[prop]"
      :data-list="list"
      :disabled="disabledCo"
      :select-params="{ multiple: multi, placeholder: placeholderCo }"
      :tree-params="{ 'default-expand-all': defaultExpandAll, 'check-strictly': checkStrictly }"
      :style="comStyle"
      @change="submit"
      @mouseenter="tipShow"
      @mouseleave="tipHide"
    ></fd-tree-select>
  </el-form-item>
  <el-tooltip v-if="tip" v-model:visible="tipVisible" placement="top" :virtual-ref="tipTriggerRef" virtual-triggering>
    <template #content>
      <span>{{ tip }}</span>
    </template>
  </el-tooltip>
</template>

<script setup lang="ts">
import { DEFAULT_ITEM_DATA_FIELDS, FORM_ITEM_DEFAULT_PROPS, ItemDataFields } from '../type'
import { PropType } from 'vue'
import { Indexable } from '@/common/types'
import useFormItem from '../hooks/use-form-item'

defineOptions({
  name: 'FdItemTree',
  inheritAttrs: false
})

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS,
  list: {
    type: Array as PropType<Indexable[]>,
    required: true
  },
  multi: {
    type: Boolean,
    default: false
  },
  fields: {
    type: Object as PropType<ItemDataFields>,
    default: () => DEFAULT_ITEM_DATA_FIELDS
  },
  defaultExpandAll: {
    type: Boolean,
    default: true
  },
  checkStrictly: {
    type: Boolean,
    default: true
  }
})

const { model, visibleCo, placeholderCo, disabledCo, itemClass, itemStyle, comStyle, submit, tipTriggerRef, tipVisible, tipShow, tipHide } =
  useFormItem(props, {
    placeholder: `请选择${props.label}`
  })
</script>
