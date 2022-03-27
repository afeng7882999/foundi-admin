<template>
  <template v-if="editShow">
    <el-button plain type="primary" @click="emitAct('edit')">编辑</el-button>
    <el-divider direction="vertical"></el-divider>
  </template>
  <template v-if="nav">
    <el-button-group>
      <el-button :disabled="!navPrev" @click="emitAct('prev')">
        <fd-icon icon="left-small" class="is-in-btn"></fd-icon>
        上一个
      </el-button>
      <el-button :disabled="!navNext" @click="emitAct('next')">
        下一个
        <fd-icon icon="right-small" class="is-in-btn is-right"></fd-icon>
      </el-button>
    </el-button-group>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdDescriptionsAct'
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, PropType } from 'vue'
import { isString } from 'lodash-es'
import usePage from '@/extend/page/use-page'
import { off, on } from '@/utils/dom'

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

const { hasAuth } = usePage()

const editShow = computed(() => {
  if (isString(props.edit)) {
    return hasAuth(props.edit)
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
