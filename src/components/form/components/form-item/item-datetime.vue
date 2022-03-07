<template>
  <template v-if="visibleCo">
    <el-form-item v-bind="$attrs" :label="noLabel ? '' : label" :prop="prop">
      <el-date-picker
        v-model="model[prop]"
        :default-time="[new Date('0 0:0:0'), new Date('0 23:59:59')]"
        :end-placeholder="placeholderCo[1]"
        format="YYYY-MM-DD"
        value-format="x"
        range-separator="-"
        :start-placeholder="placeholderCo[0]"
        type="daterange"
        :style="styleCo"
        :disabled="disabledCo"
        @change="formSubmit"
      ></el-date-picker>
    </el-form-item>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdItemDatetime',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { FORM_ITEM_DEFAULT_PROPS } from '@/components/form/type'
import useFormItem from '@/components/form/hooks/use-form-item'

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS
})

const { model, placeholderCo, visibleCo, disabledCo, styleCo, formSubmit } = useFormItem(props, {
  width: '250',
  placeholder: '开始日期,结束日期'
})
</script>
