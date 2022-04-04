<template>
  <el-form ref="form" v-bind="$attrs" :class="objClass">
    <slot />
  </el-form>
</template>

<script lang="ts">
export default {
  name: 'FdForm',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import useBreakpoint from '@/hooks/use-breakpoint'
import { ElForm } from 'element-plus'
import { ValidateFieldsError } from 'async-validator'

const props = defineProps({
  mobileCompact: {
    type: Boolean,
    default: true
  }
})

const form = ref<InstanceType<typeof ElForm>>()

const { isMobile } = useBreakpoint(props.mobileCompact)

const objClass = computed(() => {
  const clazz = ['fd-form']
  if (isMobile.value) {
    clazz.push('is-mobile')
  }
  return clazz.join(' ')
})

const validate = async (callback?: (isValid?: boolean, invalidFields?: ValidateFieldsError) => void) => {
  await form.value?.validate(callback)
}

const validateField = async (props: string | string[], callback: (isValid?: string, invalidFields?: ValidateFieldsError) => void) => {
  await form.value?.validateField(props, callback)
}

const resetFields = () => {
  form.value?.resetFields()
}

const scrollToField = (prop: string) => {
  form.value?.scrollToField(prop)
}

const clearValidate = (props?: string | string[]) => {
  form.value?.clearValidate(props)
}

defineExpose({
  validate,
  validateField,
  resetFields,
  scrollToField,
  clearValidate
})
</script>
