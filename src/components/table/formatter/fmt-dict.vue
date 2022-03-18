<template>
  {{ formatted }}
</template>

<script lang="ts">
export default {
  name: 'FdFmtDict'
}
</script>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { DictItem } from '@/api/system/dict-item'
import useDict from '@/components/crud/use-dict'

const props = defineProps({
  data: String,
  dict: {
    type: Array as PropType<DictItem[]>,
    default: () => [] as DictItem[]
  }
})

const { dictVal } = useDict()

const formatted = computed(() => {
  return props.data ? dictVal(props.dict, props.data) : ''
})
</script>
