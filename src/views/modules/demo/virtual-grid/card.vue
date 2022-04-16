<template>
  <div v-if="src" class="file-card">
    <img :src="src" class="el-image" style="object-fit: cover" />
    <span class="file-card__label">{{ filename }}</span>
  </div>
  <div v-else class="file-card" style="background-color: #00acc1"></div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DemoImgCard'
})

const props = defineProps({
  src: String,
  filename: String
})
</script>

<style lang="scss" scoped>
.file-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 400px;
  overflow: hidden;
}
.el-image {
  padding: 0 5px;
  width: 100%;
  height: 300px;
}
.file-card__label {
  padding: 8px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.dot {
  animation: dot 2s infinite steps(3, start);
  overflow: hidden;
}
</style>
