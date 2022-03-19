<template>
  <template v-if="visibleCo">
    <el-form-item :label="label" :prop="prop">
      <el-select v-model="model[prop]" clearable :multiple="multi" :placeholder="placeholderCo" :style="styleCo" @change="formSubmit">
        <el-option
          v-for="item in dict"
          :key="item.itemKey"
          :label="item.itemValue"
          :value="item.itemKey"
          :disabled="disabledCo"
        ></el-option>
      </el-select>
    </el-form-item>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdFmiDict',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { FORM_ITEM_DEFAULT_PROPS } from '@/extend/form/type'
import useFormItem from '@/extend/form/hooks/use-form-item'
import { DictItem } from '@/api/system/dict-item'

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS,
  dict: {
    type: Array,
    default: () => [] as DictItem[]
  },
  multi: {
    type: Boolean,
    default: false
  }
})

const { model, placeholderCo, visibleCo, disabledCo, styleCo, formSubmit } = useFormItem(props, { width: '150', placeholder: `请选择${props.label}` })
</script>
