<template>
  <template v-if="visibleCo">
    <el-form-item v-bind="$attrs" :label="label" :prop="prop">
      <fd-tree-select
        v-model="model()[prop]"
        :data-list="list"
        :disabled="disabledCo"
        :select-params="{ multiple: multi, placeholder: placeholderCo }"
        :tree-params="{ 'default-expand-all': defaultExpandAll, 'check-strictly': checkStrictly }"
        :style="styleCo"
        @change="submit"
      ></fd-tree-select>
    </el-form-item>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdItemTree',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { DEFAULT_ITEM_DATA_FIELDS, FORM_ITEM_DEFAULT_PROPS, ItemDataFields } from '@/extend/form/type'
import { PropType } from 'vue'
import { Indexable } from '@/common/types'
import useFormItem from '@/extend/form/hooks/use-form-item'

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

const { model, visibleCo, placeholderCo, disabledCo, styleCo, submit } = useFormItem(props, { placeholder: `请选择${props.label}` })
</script>
