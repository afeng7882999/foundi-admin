<template>
  <template v-if="visibleCo">
    <el-form-item v-bind="$attrs" :label="label" :style="itemStyle" :prop="prop">
      <template v-if="type === 'switch'">
        <el-switch
          v-model="model()[prop]"
          clearable
          :placeholder="placeholderCo"
          :style="comStyle"
          :disabled="disabledCo"
          :active-text="labelsCo[0]"
          :inactive-text="labelsCo[1]"
        />
      </template>
      <template v-else>
        <el-select v-model="model()[prop]" clearable :disabled="disabledCo" :placeholder="placeholderCo" :style="comStyle" @change="submit">
          <el-option :label="labelsCo[0]" :value="true"></el-option>
          <el-option :label="labelsCo[1]" :value="false"></el-option>
        </el-select>
      </template>
    </el-form-item>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdItemBoolean',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { FORM_ITEM_DEFAULT_PROPS } from '@/extend/form/type'
import useFormItem from '@/extend/form/hooks/use-form-item'
import { computed, PropType } from 'vue'

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS,
  type: {
    type: String as PropType<'switch' | 'select'>,
    default: 'switch',
    validator: (val: string) => ['switch', 'select'].includes(val)
  },
  labels: {
    type: String,
    default: '是,否'
  }
})

const labelsCo = computed(() => {
  if (props.labels) {
    const pl = props.labels.split(',').map((s) => s.trim())
    return [pl[0], pl[1]]
  }
  return ['是', '否']
})

const { model, placeholderCo, visibleCo, disabledCo, itemStyle, comStyle, submit } = useFormItem(props)
</script>
