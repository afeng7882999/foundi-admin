<template>
  <template v-if="visibleCo">
    <el-form-item :label="label" :prop="prop">
      <el-input v-model="model[prop]" clearable :placeholder="placeholderCo" :style="styleCo" :disabled="disabledCo" />
    </el-form-item>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdItem',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { FORM_ITEM_DEFAULT_PROPS } from '@/components/form/type'
import useFormItem from '@/components/form/hooks/use-form-item'

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS
})

const { model, placeholderCo, visibleCo, disabledCo, styleCo } = useFormItem(props, { width: '150', placeholder: `请输入${props.label}` })
</script>
