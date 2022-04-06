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
    <el-date-picker
      v-model="model()[prop]"
      :default-time="[new Date('0 0:0:0'), new Date('0 23:59:59')]"
      :end-placeholder="placeholderCo[1]"
      format="YYYY-MM-DD"
      value-format="x"
      range-separator="-"
      :start-placeholder="placeholderCo[0]"
      type="daterange"
      :style="comStyle"
      :disabled="disabledCo"
      @change="submit"
      @mouseenter="tipShow"
      @mouseleave="tipHide"
    ></el-date-picker>
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
  name: 'FdItemDateRange',
  inheritAttrs: false
})

const props = defineProps({
  ...FORM_ITEM_DEFAULT_PROPS
})

const { model, placeholderCo, visibleCo, disabledCo, itemClass, itemStyle, comStyle, submit, tipTriggerRef, tipVisible, tipShow, tipHide } =
  useFormItem(props, {
    width: '250',
    placeholder: '开始日期,结束日期'
  })
</script>
