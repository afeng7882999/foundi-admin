import { useRoute } from 'vue-router'
import { computed } from 'vue'

export default function useMobilePage(react: boolean | undefined = true) {
  const route = useRoute()

  const isMobilePage = computed(() => {
    if (!react) {
      return false
    }
    return route.meta.isMobile === true
  })

  return {
    isMobilePage
  }
}
