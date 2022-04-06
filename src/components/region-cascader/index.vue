<template>
  <el-cascader v-model="state.selectedRegions" :options="state.regions" @change="onCascaderChange"></el-cascader>
</template>

<script setup lang="ts">
import { region3Array, codeToName, nameToCode } from './region'
import { PropType, reactive, watch } from 'vue'
import { RegionObj } from './types'

defineOptions({
  name: 'FdRegionCascader'
})

const props = defineProps({
  modelValue: {
    type: Object as PropType<RegionObj>
  }
})

const state = reactive({
  regions: region3Array,
  selectedRegions: [] as string[]
})

watch(
  () => props.modelValue,
  (val) => {
    state.selectedRegions = []
    if (val == undefined) {
      return
    }
    let r1, r2, r3
    if (val.province) {
      r1 = nameToCode[val.province]
      if (r1) {
        state.selectedRegions.push(r1.code)
      }
    }
    if (r1 && val.city) {
      r2 = r1[val.city]
      if (r2) {
        state.selectedRegions.push(r2.code)
      }
    }
    if (r2 && val.district) {
      r3 = r2[val.district]
      if (r3) {
        state.selectedRegions.push(r3.code)
      }
    }
  },
  { immediate: true, deep: true }
)

const emit = defineEmits(['update:modelValue'])

const onCascaderChange = (val: string[]) => {
  emit('update:modelValue', {
    province: codeToName[val[0]],
    city: codeToName[val[1]],
    district: codeToName[val[2]]
  })
}
</script>
