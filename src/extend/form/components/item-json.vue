<template>
  <el-form-item
    v-show="visibleCo"
    class="fd-code-editor-form-item"
    v-bind="$attrs"
    :class="itemClass"
    :label="label"
    :style="itemStyle"
    :prop="prop"
  >
    <template #label>
      <span>
        {{ label }}
        <span v-if="tipIcon" class="tip-icon" @mouseenter="tipShow" @mouseleave="tipHide">
          <fd-icon icon="help" class="is-tip" />
        </span>
      </span>
    </template>
    <fd-code-editor
      ref="jsonEditor"
      v-model="model()[prop]"
      border
      language="application/json"
      :disabled="disabledCo"
      :style="comStyle"
      line-numbers
      @mouseenter="tipShow"
      @mouseleave="tipHide"
    />
  </el-form-item>
  <el-tooltip v-if="tip" v-model:visible="tipVisible" placement="top" :virtual-ref="tipTriggerRef" virtual-triggering>
    <template #content>
      <span>{{ tip }}</span>
    </template>
  </el-tooltip>
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

const {
  model,
  visibleCo,
  disabledCo,
  comStyle,
  itemClass,
  itemStyle,
  onBeforeOpen,
  onBeforeSubmitData,
  tipTriggerRef,
  tipVisible,
  tipShow,
  tipHide
} = useFormItem(props)

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
