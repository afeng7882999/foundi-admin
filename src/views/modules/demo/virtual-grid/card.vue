<template>
  <a href="#">
    <img :src="src" alt="" />
    <span class="file-card__label">{{ filename }}</span>
  </a>
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
a {
  display: block;
  width: 100%;
  height: 240px;
  padding: 16px 16px 48px 16px;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 2px 2px 5px rgba(#000, 0.2);
}
</style>
