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
      :readonly="readonly"
      @keyup.enter="submit"
      @clear="submit"
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
import { FORM_ITEM_DEFAULT_PROPS } from '../type'
import useFormItem from '../hooks/use-form-item'

defineOptions({
  name: 'FdItem',
  inheritAttrs: false
})

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS,
  readonly: {
    type: Boolean,
    default: false
  }
})

const { model, placeholderCo, visibleCo, disabledCo, itemClass, itemStyle, comStyle, submit, tipTriggerRef, tipVisible, tipShow, tipHide } =
  useFormItem(props, {
    width: '150',
    placeholder: `请输入${props.label}`
  })
</script>
