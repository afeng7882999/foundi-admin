<template>
  <div v-if="hasAuth('demo:uploadForm:list')" :style="docMinHeight" class="page-demo-upload-form fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <div class="fd-page__sub-title"><span class="title-text">UploadInput</span></div>
      <fd-upload-input v-model="inputVal"></fd-upload-input>
    </div>
    <div class="fd-page__form">
      <div class="fd-page__sub-title"><span class="title-text">UploadImg</span></div>
      <fd-upload-img v-model="imgVal"></fd-upload-img>
    </div>
  </div>
  <fd-page-footer></fd-page-footer>
</template>

<script lang="ts">
export default {
  name: 'DemoUploadForm'
}
</script>

<script setup lang="ts">
import usePage from '@/extend/page/use-page'
import FdUploadInput from '@/components/upload-form/upload-input.vue'
import FdUploadImg from '@/components/upload-form/upload-img.vue'
import { ref } from 'vue'
import FdPageFooter from '@/extend/page/page-footer.vue'

const inputVal = ref('')
const imgVal = ref('')

const { docMinHeight, showPageHeader, hasAuth } = usePage()
</script>
