<template>
  <el-form ref="form" v-bind="$attrs" :class="objClass">
    <slot />
  </el-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import useLayoutSize from '@/hooks/use-layout-size'
import { ElForm } from 'element-plus'
import { ValidateFieldsError } from 'async-validator'

defineOptions({
  name: 'FdForm',
  inheritAttrs: false
})

const props = defineProps({
  mobileCompact: {
    type: Boolean,
    default: true
  }
})

const form = ref<InstanceType<typeof ElForm>>()

const { isMobile } = useLayoutSize(props.mobileCompact)

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
