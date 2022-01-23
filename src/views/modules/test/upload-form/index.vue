<template>
  <div v-if="hasAuth('test:uploadForm:list')" :style="docMinHeight" class="page-test-upload-form fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <div class="fd-page__sub-title"><span class="title-text">UploadInput</span></div>
      <fd-upload-input v-model="inputVal" size="medium"></fd-upload-input>
    </div>
    <div class="fd-page__form">
      <div class="fd-page__sub-title"><span class="title-text">UploadImg</span></div>
      <fd-upload-img v-model="imgVal"></fd-upload-img>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TestUploadForm'
}
</script>

<script setup lang="ts">
import usePage from '@/components/crud/use-page'
import FdUploadInput from '@/components/upload-form/upload-input.vue'
import FdUploadImg from '@/components/upload-form/upload-img.vue'
import { ref } from 'vue'

const inputVal = ref('')
const imgVal = ref('')

const { docMinHeight, showPageHeader, hasAuth } = usePage()
</script>
