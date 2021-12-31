<template>
  <el-dialog v-model="visible" :title="title" append-to-body top="5vh" width="80%">
    <el-tabs v-model="activeName" @tab-click="onTabClick">
      <el-tab-pane v-for="(item, idx) in data" :key="idx" :label="item.name" :name="idx + ''"></el-tab-pane>
    </el-tabs>
    <fd-code-editor :langage="activeLanguage" :value="activeContent" line-numbers></fd-code-editor>
  </el-dialog>
</template>

<script lang="ts">
import { getFileExt } from '@/utils/file'
import { defineComponent, reactive, toRefs } from 'vue'
import FdCodeEditor from '@/components/code-editor/index.vue'
import { preview } from '@/api/generator/gen-table'
import { AnyObject } from '@/utils'

const LANG_OF_FILENAME = {
  java: 'text/x-java',
  vue: 'text/x-vue',
  xml: 'application/xml',
  sql: 'text/x-sql',
  ts: 'text/typescript'
} as Record<string, string>

export default defineComponent({
  name: 'GeneratorPreview',
  components: { FdCodeEditor },
  setup() {
    const state = reactive({
      visible: false,
      title: '代码预览',
      data: [] as AnyObject[],
      activeContent: '',
      activeLanguage: '',
      activeName: '0'
    })

    const open = async (tableId: string) => {
      try {
        state.data = await preview(tableId)
        const ext = getFileExt(state.data[0].name)
        state.activeName = '0'
        state.activeContent = state.data[0].content
        state.activeLanguage = LANG_OF_FILENAME[ext]
        state.visible = true
      } catch (e) {
        console.log(e)
      }
    }

    const onTabClick = (tab: any) => {
      if (tab) {
        const ext = getFileExt(state.data[tab.index].name)
        state.activeContent = state.data[tab.index].content
        state.activeLanguage = LANG_OF_FILENAME[ext]
      }
    }

    return {
      ...toRefs(state),
      open,
      onTabClick
    }
  }
})
</script>

<style lang="scss">
.fd-code-block {
  @import 'highlight.js/scss/vs.scss';
}
</style>
