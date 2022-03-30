<template>
  <el-form-item v-show="visibleCo" v-bind="$attrs" :class="itemClass" :label="label" :style="itemStyle" :prop="prop">
    <el-input
      v-model="model()[prop]"
      clearable
      :placeholder="placeholderCo"
      :style="comStyle"
      :disabled="disabledCo"
      @keyup.enter="submit"
      @clear="submit"
    />
  </el-form-item>
</template>

<script lang="ts">
export default {
  name: 'FdItem',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { FORM_ITEM_DEFAULT_PROPS } from '@/extend/form/type'
import useFormItem from '@/extend/form/hooks/use-form-item'

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS
})

const { model, placeholderCo, visibleCo, disabledCo, itemClass, itemStyle, comStyle, submit } = useFormItem(props, {
  width: '150',
  placeholder: `请输入${props.label}`
})
</script>
