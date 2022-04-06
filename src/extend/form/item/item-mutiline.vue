<template>
  <el-form-item v-show="visibleCo" v-bind="$attrs" :class="itemClass" :label="label" :style="itemStyle" :prop="prop">
    <template #label>
      <span>
        {{ label }}
        <span v-if="tipIcon" class="tip-icon" @mouseenter="tipShow" @mouseleave="tipHide">
          <fd-icon icon="help" class="is-tip" />
        </span>
      </span>
    </template>
    <el-input
      v-model="model()[prop]"
      clearable
      :placeholder="placeholderCo"
      :style="comStyle"
      :disabled="disabledCo"
      :autosize="{ minRows: 3 }"
      type="textarea"
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

<script setup lang="ts">
import { FORM_ITEM_DEFAULT_PROPS } from '@/extend/form/type'
import useFormItem from '@/extend/form/hooks/use-form-item'

defineOptions({
  name: 'FdItemMultiline',
  inheritAttrs: false
})

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS
})

const { model, placeholderCo, visibleCo, disabledCo, itemClass, itemStyle, comStyle, tipTriggerRef, tipVisible, tipShow, tipHide } =
  useFormItem(props)
</script>
