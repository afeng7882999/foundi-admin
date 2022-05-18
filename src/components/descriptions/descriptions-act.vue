<template>
  <template v-if="editShow">
    <fd-button label="编辑" plain color="primary" @click="emitAct('edit')" />
    <el-divider direction="vertical"></el-divider>
  </template>
  <template v-if="nav">
    <el-button-group>
      <fd-button icon="left-small" :disabled="!navPrev" @click="emitAct('prev')" />
      <fd-button icon="right-small" :disabled="!navNext" @click="emitAct('next')" />
    </el-button-group>
  </template>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, PropType } from 'vue'
import { isString } from 'lodash-es'
import usePage from '@/crud/hooks/use-page'
import { off, on } from '@/utils/dom'

defineOptions({
  name: 'FdDescriptionsAct'
})

const props = defineProps({
  edit: {
    type: [Boolean, String] as PropType<boolean | string>,
    default: false
  },
  nav: {
    type: Boolean,
    default: true
  },
  navPrev: {
    type: Boolean,
    default: false
  },
  navNext: {
    type: Boolean,
    default: true
  }
})

const { auth } = usePage()

const editShow = computed(() => {
  if (isString(props.edit)) {
    return auth(props.edit)
  }
  return props.edit
})

const emit = defineEmits(['edit', 'prev', 'next'])
const emitAct = (event: 'edit' | 'prev' | 'next') => {
  emit(event)
}

onMounted(() => {
  on(document, 'keyup', onKeyEvent)
})

onBeforeUnmount(() => {
  off(document, 'keyup', onKeyEvent)
})

const onKeyEvent = (evt: Event) => {
  const kEvt = evt as KeyboardEvent
  if (kEvt.code === 'ArrowLeft') {
    emitAct('prev')
  } else if (kEvt.code === 'ArrowRight') {
    emitAct('next')
  }
}
</script>
