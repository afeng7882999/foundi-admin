<template>
  <div v-if="auth('demo:misc:list')" :style="docMinHeight" class="page-demo-misc fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <div class="fd-page__sub-title"><span class="title-text">Button</span></div>
      <demo-misc-button />
    </div>
  </div>
  <fd-page-footer></fd-page-footer>
</template>

<script setup lang="ts">
import usePage from '@/crud/hooks/use-page'
import FdPageFooter from '@/crud/page/page-footer.vue'
import DemoMiscButton from './button.vue'

defineOptions({
  name: 'DemoMisc'
})

const { docMinHeight, showPageHeader, auth } = usePage()
</script>
