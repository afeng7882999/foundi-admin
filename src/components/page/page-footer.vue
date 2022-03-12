<template>
  <template v-if="visible">
    <div class="fd-page-footer">
      <fd-svg-image class="fd-page-footer__icon" img="foundi"></fd-svg-image>
      <span class="fd-page-footer__text">{{ settings.footer }}</span>
    </div>
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdPageFooter'
}
</script>

<script setup lang="ts">
import settings from '@/app/settings'
import FdSvgImage from '@/components/svg-image/svg-image.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  }
})
</script>
