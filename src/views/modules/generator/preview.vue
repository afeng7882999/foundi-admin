<template>
  <div :style="docHeight" class="page-generator-preview fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page-act">
      <el-button @click="close()">
        <fd-icon class="is-in-btn" icon="left"></fd-icon>
        返回列表
      </el-button>
      <div class="fd-page-act__right">
        <fd-button
          v-show="auth('generator:genTable:edit')"
          label="生成"
          icon="download"
          plain
          color="primary"
          :loading="state.genLoading"
          @click="handleGenerate"
        />
      </div>
    </div>
    <fd-split-pane :default-pos="300" shrink="right" :style="previewStyle">
      <template #left>
        <div v-loading="state.loading" class="fd-page__form page-generator-preview__tree" style="height: 100%">
          <div class="fd-page__sub-title"><span class="title-text">文件列表</span></div>
          <el-scrollbar always>
            <el-tree
              ref="codeTree"
              :data="state.nodeData"
              :default-expand-all="true"
              :highlight-current="true"
              :props="{ label: 'name', children: 'children', value: 'id' }"
              node-key="id"
              @node-click="onTreeNodeClick"
            >
              <template #default="{ node, data }">
                <span class="page-generator-preview__node">
                  <fd-icon v-if="data.lang" icon="file" class="tree-node-icon is-file"></fd-icon>
                  <fd-icon v-else-if="node.expanded" icon="folder-open" class="tree-node-icon is-folder"></fd-icon>
                  <fd-icon v-else icon="folder-close" class="tree-node-icon is-folder"></fd-icon>
                  {{ node.label }}
                </span>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>
      </template>
      <template #right>
        <div v-loading="state.loading" class="fd-page__form page-generator-preview__code" style="height: 100%">
          <div class="fd-page__sub-title">
            <span class="title-text">{{ state.activeNode.path }}</span>
          </div>
          <fd-code-editor
            ref="codeEditor"
            v-model="state.activeNode.code.content"
            :langage="state.activeNode.lang"
            line-numbers
          ></fd-code-editor>
        </div>
      </template>
    </fd-split-pane>
  </div>
</template>

<script setup lang="ts">
import usePage from '@/extend/page/use-page'
import { downloadFile, getFileExt } from '@/utils/file'
import { computed, nextTick, onBeforeMount, reactive, ref, Ref } from 'vue'
import FdCodeEditor from '@/components/code-editor/index.vue'
import { CodePreview, preview } from '@/api/generator/gen-table'
import { useRoute, useRouter } from 'vue-router'
import FdSplitPane from '@/components/split-pane/index.vue'
import { CodePreviewNode, LANG_OF_FILENAME } from '@/views/modules/generator/types'
import * as fflate from 'fflate'
import { strToU8 } from 'fflate'
import { Indexable } from '@/common/types'
import { ElTree } from 'element-plus'
import { FdCodeEditorInst } from '@/components/code-editor/code-editor'
import { useThrottleFn, useTimeoutFn } from '@vueuse/core'
import useView from '@/extend/page/use-view'

defineOptions({
  name: 'GeneratorPreview'
})

const codeEditor = ref() as Ref<FdCodeEditorInst>
const codeTree = ref() as Ref<InstanceType<typeof ElTree>>

const state = reactive({
  data: [] as CodePreview[],
  nodeData: [] as CodePreviewNode[],
  activeNode: {
    id: 0,
    name: '',
    lang: 'application/xml',
    code: { name: '', path: '', content: '' }
  } as CodePreviewNode,
  loading: false,
  genLoading: false
})

const { showPageHeader, docHeight, getDocHeightNoHeaderFooter, getDocHeight } = usePage()

const previewStyle = computed(() => {
  return { height: getDocHeightNoHeaderFooter(82, 'px') }
})

const route = useRoute()
const router = useRouter()

const { auth } = usePage()

const getCodeTree = (idx: number) => {
  let id = 0
  for (const item of state.data) {
    const paths = item.path.split('/').filter((s) => !!s)
    const len = paths.length
    let parents = state.nodeData

    for (let i = 0; i < len - 1; i++) {
      let parent = parents.find((d) => d.name === paths[i])
      if (parent) {
        parents = parent.children as CodePreviewNode[]
        continue
      }
      parent = { id: id++, name: paths[i], children: [] }
      parents.push(parent)
      parents = parent.children as CodePreviewNode[]
    }

    const ext = getFileExt(item.name)
    const file = {
      id: id++,
      name: item.name,
      path: item.path.replace(/\//g, ' / '),
      lang: LANG_OF_FILENAME[ext],
      code: item
    }
    parents.push(file)
    if (state.activeNode.id === 0) {
      state.activeNode = file
    }
  }
}

const compactCodeTree = (parent: CodePreviewNode | null, children: CodePreviewNode[]) => {
  if (parent && parent.children?.length === 1 && !children[0].lang) {
    parent.name = parent.name + '/' + children[0].name
    parent.children = children[0].children
    if (parent.children) {
      compactCodeTree(parent, parent.children)
    }
    return
  }
  for (const child of children) {
    if (child.children) {
      compactCodeTree(child, child.children)
    }
  }
}

onBeforeMount(async () => {
  const { ids } = route.params
  if (ids) {
    state.loading = true
    try {
      state.data = await preview(ids as string)
      getCodeTree(0)
      compactCodeTree(null, state.nodeData)
      await nextTick(() => {
        codeTree.value.setCurrentKey(state.activeNode.id)
        codeEditor.value.refresh('100%', getDocHeightNoHeaderFooter(126, 'px'))
        state.loading = false
      })
    } catch (e) {
      state.loading = false
      console.log(e)
    }
  }
})

const onTreeNodeClick = async (node: CodePreviewNode) => {
  if (node.code) {
    state.activeNode = node
    await nextTick(() => {
      codeEditor.value.refresh('100%', getDocHeightNoHeaderFooter(126, 'px'))
    })
  }
}

const { goBackToView } = useView()
const close = () => {
  goBackToView('/generator')
}

const { start: loadingFalseDelay } = useTimeoutFn(() => (state.genLoading = false), 1500, { immediate: false })
const handleGenerate = useThrottleFn(
  () => {
    state.genLoading = true
    const files = {} as Indexable
    try {
      state.data.forEach((item) => {
        files[item.path] = strToU8(item.content)
      })
      const zipped = fflate.zipSync(files)
      downloadFile(zipped, 'code_generated', 'zip')
      loadingFalseDelay()
    } catch (e) {
      console.log(e)
      state.genLoading = false
    }
  },
  1500,
  false,
  true
)
</script>

<style lang="scss">
.page-generator-preview {
  &__tree {
    border-radius: var(--el-border-radius-base) 0 0 var(--el-border-radius-base);
    padding: 0;

    .fd-page__sub-title {
      font-size: var(--el-font-size-base);
      font-weight: normal;
      margin: 16px 16px 8px 16px;
    }

    .tree-node-icon {
      font-size: var(--el-font-size-medium);
      color: var(--el-color-info);

      &.is-folder {
        color: var(--el-color-warning);
      }
    }

    .el-scrollbar {
      height: calc(100% - 45px);
    }

    .el-tree {
      padding: 8px 16px;
      font-size: var(--el-font-size-small);
      font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
      .el-tree-node > .el-tree-node__children {
        overflow: visible;
      }
      .el-tree-node__content {
        height: 20px;
      }
    }
  }

  &__code {
    border-radius: 0 var(--el-border-radius-base) var(--el-border-radius-base) 0;
    padding: 0;

    .fd-page__sub-title {
      font-size: var(--el-font-size-base);
      font-weight: normal;
      margin: 16px 16px 8px 16px;
    }

    .CodeMirror-scrollbar-filler {
      display: none !important;
    }
  }
}
.fd-code-block {
  @import 'highlight.js/scss/vs.scss';
}
</style>
