<template>
  <template v-if="typ === 'dialog'">
    <el-dialog v-model="state.visible" :close-on-click-modal="false" :title="state.isCreate ? '新增' : '修改'" @closed="hideDialog">
      <slot />
      <template #footer>
        <span class="fd-dialog__footer">
          <slot name="footer" />
          <el-button @click="state.visible = false">取消</el-button>
          <el-button type="primary" @click="submit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </template>
  <template v-else-if="typ === 'drawer'">
    <fd-drawer v-model="state.visible" :close-on-click-modal="false" :modal="false" :title="title" :size="size">
      <slot />
      <template #footer>
        <slot name="footer" />
        <el-button @click="state.visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </fd-drawer>
  </template>
  <template v-else>
    <slot />
  </template>
</template>

<script lang="ts">
export default {
  name: 'FdPageModal'
}
</script>

<script setup lang="ts">
import { PropType, reactive } from 'vue'
import usePage from '@/extend/page/use-page'

const props = defineProps({
  typ: {
    type: String as PropType<'page' | 'dialog' | 'drawer'>,
    default: 'drawer'
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: '600px'
  }
})

const state = reactive({
  visible: false
})

const emit = defineEmits(['update:visible'])

const { onSmSize } = usePage()

onSmSize((w1, w2) => {
  console.log('sssss', w1, w2)
})
</script>
