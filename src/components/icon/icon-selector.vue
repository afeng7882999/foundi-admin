<template>
  <el-input class="fd-icon-selector" v-model="icon" clearable :placeholder="placeholder" @click="onInputClick">
    <template #prefix>
      <fd-icon class="fd-icon-selector__icon" :icon="icon"></fd-icon>
    </template>
  </el-input>
  <el-dialog v-model="state.visible" title="选择图标" append-to-body width="60%">
    <fd-icon-list :show-filter="ifShowFilter" :show-label="ifShowLabel" :value="icon" @select-changed="onIconListChanged"></fd-icon-list>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'FdIconSelector'
}
</script>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import FdIconList from './icon-list.vue'

const props = defineProps({
  modelValue: {
    type: String
  },
  placeholder: {
    type: String,
    default: '请选择图标'
  },
  ifShowFilter: {
    type: Boolean,
    default: true
  },
  ifShowLabel: {
    type: Boolean,
    default: true
  }
})

const state = reactive({
  visible: false
})

const emit = defineEmits(['update:modelValue'])

const icon = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})

const onInputClick = () => {
  state.visible = true
}

const onIconListChanged = (val: string) => {
  state.visible = false
  icon.value = val
}
</script>
