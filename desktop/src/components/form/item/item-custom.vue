<template>
  <el-form-item v-show="visibleCo" v-bind="$attrs" :class="itemClass" :label="label" :style="itemStyle" :prop="prop">
    <slot />
  </el-form-item>
</template>

<script setup lang="ts">
import { FORM_ITEM_DEFAULT_PROPS } from '../type'
import useFormItem from '../hooks/use-form-item'

defineOptions({
  name: 'FdItemCustom',
  inheritAttrs: false
})

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS
})

const { visibleCo, itemClass, itemStyle } = useFormItem(props)
</script>
