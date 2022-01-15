<template>
  <div :style="pageHeight" class="page-generator-preview fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <div class="fd-page__action">
        <el-button size="medium" @click="close()">
          <fd-icon class="is-in-btn" icon="left"></fd-icon>
          返回列表
        </el-button>
      </div>
    </div>
    <fd-split-pane :default-pos="300" shrink="right" :style="previewHeight">
      <template #left>
        <div class="fd-page__form page-generator-preview__tree" style="height: 100%">
          <el-scrollbar always>
            <el-tree
              ref="codeTree"
              :data="state.nodeData"
              :default-expand-all="true"
              :highlight-current="true"
              :props="{ label: 'name', children: 'children', value: 'id' }"
              node-key="name"
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
        <div class="fd-page__form page-generator-preview__code" style="height: 100%">
          <fd-code-editor
            ref="codeEditor"
            :langage="state.activeNode.lang"
            :value="state.activeNode.code.content"
            line-numbers
          ></fd-code-editor>
        </div>
      </template>
    </fd-split-pane>
  </div>
</template>

<script lang="ts">
export default {
  name: 'GeneratorPreview'
}
</script>

<script setup lang="ts">
import usePage from '@/components/crud/use-page'
import { getFileExt } from '@/utils/file'
import { computed, nextTick, onBeforeMount, reactive, ref } from 'vue'
import FdCodeEditor from '@/components/code-editor/index.vue'
import { ICodePreview, preview } from '@/api/generator/gen-table'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import FdSplitPane from '@/components/split-pane/index.vue'
import { ICodePreviewNode, LANG_OF_FILENAME } from '@/views/modules/generator/types'

const codeEditor = ref()

const state = reactive({
  data: [] as ICodePreview[],
  nodeData: [] as ICodePreviewNode[],
  activeNode: {
    id: 0,
    name: '',
    lang: 'application/xml',
    code: { name: '', path: '', content: '' }
  } as ICodePreviewNode
})

const { pageHeight, showPageHeader } = usePage()

const store = useStore<AllState>()
const storeState = store.state as AllState

const previewHeight = computed(() => {
  const height = storeState.app.docHeight - 105
  return { height: height + 'px' }
})

const route = useRoute()
const router = useRouter()

const getCodeTree = (idx: number) => {
  let id = 0
  for (const item of state.data) {
    const paths = item.path.split('/').filter((s) => !!s)
    const len = paths.length
    let parents = state.nodeData

    for (let i = 0; i < len - 1; i++) {
      let parent = parents.find((d) => d.name === paths[i])
      if (parent) {
        parents = parent.children as ICodePreviewNode[]
        continue
      }
      parent = { id: id++, name: paths[i], children: [] }
      parents.push(parent)
      parents = parent.children as ICodePreviewNode[]
    }

    const ext = getFileExt(item.name)
    parents.push({ id: id++, name: item.name, lang: LANG_OF_FILENAME[ext], code: item })
  }
}

const compactCodeTree = (parent: ICodePreviewNode | null, children: ICodePreviewNode[]) => {
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
  const { id } = route.params
  if (id) {
    try {
      state.data = await preview(id as string)
      getCodeTree(0)
      compactCodeTree(null, state.nodeData)
      nextTick(() => {
        ;(codeEditor.value as any).refresh('100%', `${storeState.app.docHeight - 107}px`)
      })
    } catch (e) {
      console.log(e)
    }
  }
})

const onTreeNodeClick = (node: ICodePreviewNode) => {
  if (node.code) {
    state.activeNode = node
    nextTick(() => {
      ;(codeEditor.value as any).refresh('100%', `${storeState.app.docHeight - 107}px`)
    })
  }
}

const close = () => {
  store.dispatch('view/delView', route)
  router.push({ path: '/generator', query: { t: Date.now() } })
}
</script>

<style lang="scss">
.page-generator-preview {
  &__tree {
    border-radius: var(--el-border-radius-base) 0 0 var(--el-border-radius-base);
    padding: 0;

    .tree-node-icon {
      font-size: var(--el-font-size-medium);
      color: var(--el-color-info);

      &.is-folder {
        color: var(--el-color-warning);
      }
    }

    .el-tree {
      padding: 5px;
      font-size: var(--el-font-size-small);
      font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
      .el-tree-node > .el-tree-node__children {
        overflow: visible;
      }
      .el-tree-node__content {
        height: 19px;
      }
    }
  }

  &__code {
    border-radius: 0 var(--el-border-radius-base) var(--el-border-radius-base) 0;
    padding: 0;
  }
}
.fd-code-block {
  @import 'highlight.js/scss/vs.scss';
}
</style>
