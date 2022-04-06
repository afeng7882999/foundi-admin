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
    <el-select
      v-model="model()[prop]"
      :multiple="multi"
      clearable
      :placeholder="placeholderCo"
      :disabled="disabledCo"
      :style="comStyle"
      @change="submit"
      @mouseenter="tipShow"
      @mouseleave="tipHide"
    >
      <el-option v-for="item in list" :key="item[fields.id]" :label="item[fields.label]" :value="item[fields.id]"></el-option>
    </el-select>
  </el-form-item>
  <el-tooltip v-if="tip" v-model:visible="tipVisible" placement="top" :virtual-ref="tipTriggerRef" virtual-triggering>
    <template #content>
      <span>{{ tip }}</span>
    </template>
  </el-tooltip>
</template>

<script setup lang="ts">
import { DEFAULT_ITEM_DATA_FIELDS, FORM_ITEM_DEFAULT_PROPS, ItemDataFields } from '@/extend/form/type'
import { PropType } from 'vue'
import { Indexable } from '@/common/types'
import useFormItem from '@/extend/form/hooks/use-form-item'

defineOptions({
  name: 'FdItemList',
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
  }
})

const { model, visibleCo, placeholderCo, disabledCo, itemClass, itemStyle, comStyle, submit, tipTriggerRef, tipVisible, tipShow, tipHide } =
  useFormItem(props, {
    placeholder: `请选择${props.label}`
  })
</script>
