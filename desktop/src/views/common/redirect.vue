<script lang="ts">
import { defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'RedirectPage',
  setup() {
    const router = useRouter()
    const { params, query } = useRoute()
    const { path } = params
    const _path = Array.isArray(path) ? path.join('/') : path
    router.replace({ path: '/' + _path, query })

    return () => h('redirect')
  }
})
</script>
