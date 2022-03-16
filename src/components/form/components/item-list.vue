<template>
  <template v-if="visibleCo">
    <el-form-item :label="label" :prop="prop">
      <el-select v-model="model[prop]" :multiple="multi" clearable :placeholder="placeholderCo" :disabled="disabledCo" @change="formSubmit">
        <el-option v-for="item in list" :key="item[fields.id]" :label="item[fields.label]" :value="item[fields.id]"></el-option>
      </el-select>
    </el-form-item>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdFmiList',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { DEFAULT_ITEM_DATA_FIELDS, FORM_ITEM_DEFAULT_PROPS, ItemDataFields } from '@/components/form/type'
import { PropType } from 'vue'
import { Indexable } from '@/types/global'
import useFormItem from '@/components/form/hooks/use-form-item'

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

const { model, visibleCo, placeholderCo, disabledCo, formSubmit } = useFormItem(props, { placeholder: `请选择${props.label}` })
</script>
