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
    <template v-if="type === 'switch'">
      <el-switch
        v-model="model()[prop]"
        clearable
        :placeholder="placeholderCo"
        :disabled="disabledCo"
        :active-text="labelsCo[0]"
        :inactive-text="labelsCo[1]"
        @mouseenter="tipShow"
        @mouseleave="tipHide"
      />
    </template>
    <template v-else>
      <el-select
        v-model="model()[prop]"
        clearable
        :disabled="disabledCo"
        :placeholder="placeholderCo"
        :style="comStyle"
        @change="submit"
        @mouseenter="tipShow"
        @mouseleave="tipHide"
      >
        <el-option :label="labelsCo[0]" :value="true"></el-option>
        <el-option :label="labelsCo[1]" :value="false"></el-option>
      </el-select>
    </template>
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
import { computed, PropType } from 'vue'

defineOptions({
  name: 'FdItemBoolean',
  inheritAttrs: false
})

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

const { model, placeholderCo, visibleCo, disabledCo, itemClass, itemStyle, comStyle, submit, tipTriggerRef, tipVisible, tipShow, tipHide } =
  useFormItem(props)
</script>
