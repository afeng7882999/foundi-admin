<template>
  <el-form-item v-show="visibleCo" v-bind="$attrs" :class="itemClass" :label="label" :style="itemStyle" :prop="prop">
    <el-input
      v-model="model()[prop]"
      clearable
      :placeholder="placeholderCo"
      :style="comStyle"
      :disabled="disabledCo"
      :autosize="{ minRows: 3 }"
      type="textarea"
    />
  </el-form-item>
</template>

<script lang="ts">
export default {
  name: 'FdItemMultiline',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { FORM_ITEM_DEFAULT_PROPS } from '@/extend/form/type'
import useFormItem from '@/extend/form/hooks/use-form-item'

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS
})

const { model, placeholderCo, visibleCo, disabledCo, itemClass, itemStyle, comStyle } = useFormItem(props)
</script>
