<template>
  <template v-if="visibleCo">
    <el-form-item v-bind="$attrs" :class="itemClass" :label="label" :style="itemStyle" :prop="prop">
      <slot />
    </el-form-item>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdItemCustom',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { FORM_ITEM_DEFAULT_PROPS } from '@/extend/form/type'
import useFormItem from '@/extend/form/hooks/use-form-item'

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS
})

const { visibleCo, itemClass, itemStyle } = useFormItem(props)
</script>
