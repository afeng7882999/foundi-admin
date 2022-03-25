<template>
  <template v-if="visibleCo">
    <el-form-item class="fd-code-editor-form-item" v-bind="$attrs" :label="label" :prop="prop">
      <fd-code-editor
        ref="jsonEditor"
        v-model="model()[prop]"
        border
        language="application/json"
        :disabled="disabledCo"
        :style="styleCo"
        line-numbers
      />
    </el-form-item>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdItemJson',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { FORM_ITEM_DEFAULT_PROPS } from '@/extend/form/type'
import useFormItem from '@/extend/form/hooks/use-form-item'
import FdCodeEditor from '@/components/code-editor/index.vue'
import { cleanStr, formatJson } from '@/utils/lang'
import { nextFrame } from '@/utils/next-frame'
import { onMounted, ref } from 'vue'

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS
})

const jsonEditor = ref()

const { model, visibleCo, disabledCo, styleCo, onBeforeOpen, onBeforeSubmitData } = useFormItem(props)

const initData = () => {
  const m = model?.()
  if (props.prop && m) {
    m[props.prop] = formatJson(m[props.prop] as string)
    nextFrame(() => {
      jsonEditor.value.refresh()
    })
  }
}

onMounted(() => {
  initData()
})

if (onBeforeOpen) {
  onBeforeOpen(async () => {
    initData()
  })
}

if (onBeforeSubmitData) {
  onBeforeSubmitData(async () => {
    const m = model?.()
    if (props.prop && m) {
      m[props.prop] = cleanStr(m[props.prop] as string)
    }
  })
}
</script>
