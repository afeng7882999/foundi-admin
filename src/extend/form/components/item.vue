<template>
  <template v-if="visibleCo">
    <el-form-item v-bind="$attrs" :label="label" :prop="prop">
      <el-input
        v-model="model()[prop]"
        clearable
        :placeholder="placeholderCo"
        :style="styleCo"
        :disabled="disabledCo"
        @keyup.enter="submit"
        @clear="submit"
      />
    </el-form-item>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdFmi',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { FORM_ITEM_DEFAULT_PROPS } from '@/extend/form/type'
import useFormItem from '@/extend/form/hooks/use-form-item'

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS
})

const { model, placeholderCo, visibleCo, disabledCo, styleCo, submit } = useFormItem(props, {
  width: '150',
  placeholder: `请输入${props.label}`
})
</script>
