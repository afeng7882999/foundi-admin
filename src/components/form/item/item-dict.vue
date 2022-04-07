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
    <el-select
      v-model="model()[prop]"
      clearable
      :multiple="multi"
      :disabled="disabledCo"
      :placeholder="placeholderCo"
      :style="comStyle"
      @change="submit"
      @mouseenter="tipShow"
      @mouseleave="tipHide"
    >
      <el-option v-for="item in dict" :key="item.itemKey" :label="item.itemValue" :value="item.itemKey"></el-option>
    </el-select>
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
import { DictItem } from '@/api/system/dict-item'

defineOptions({
  name: 'FdItemDict',
  inheritAttrs: false
})

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS,
  dict: {
    type: Array,
    default: () => [] as DictItem[]
  },
  multi: {
    type: Boolean,
    default: false
  }
})

const { model, placeholderCo, visibleCo, disabledCo, itemClass, itemStyle, comStyle, submit, tipTriggerRef, tipVisible, tipShow, tipHide } =
  useFormItem(props, {
    width: '150',
    placeholder: `请选择${props.label}`
  })
</script>
