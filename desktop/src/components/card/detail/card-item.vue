<template>
  <div class="fd-detail-card-item__label">{{ label }}</div>
  <div class="fd-detail-card-item__value">
    <slot>
      {{ value }}
    </slot>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'FdDetailCardItem'
})

const props = defineProps({
  label: String,
  value: [String, Number, Array, Object]
})
</script>
