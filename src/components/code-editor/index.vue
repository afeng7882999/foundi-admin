<template>
  <div class="fd-code-editor" :class="{ bordered: border }">
    <textarea ref="textarea" v-model="state.cmValue"></textarea>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FdCodeEditor'
}
</script>

<script setup lang="ts">
import { reactive, onMounted, watch, ref, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { merge } from 'lodash-es'
import { nextFrame } from '@/utils/next-frame'
import CodeMirror, { EditorFromTextArea } from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/scroll/simplescrollbars'
import 'codemirror/addon/scroll/simplescrollbars.css'
import 'codemirror/theme/mbo.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/css/css.js'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/sql/sql.js'
import 'codemirror/mode/vue/vue.js'

const DARK_MODE_THEME = 'mbo'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  readonly: {
    type: Boolean,
    default: false
  },
  lineNumbers: {
    type: Boolean,
    default: false
  },
  cmOptions: {
    type: Object,
    default: null
  },
  border: {
    type: Boolean,
    default: false
  }
})

const textarea = ref()
let cmInstance = null as EditorFromTextArea | null

const store = useStore<AllState>()
const storeState = store.state as AllState

const state = reactive({
  cmValue: props.modelValue,
  options: {
    mode: props.language ? props.language : 'javascript',
    smartIndent: true,
    tabSize: 2,
    lineNumbers: props.lineNumbers,
    readOnly: (props.readonly ? 'nocursor' : false) as any,
    autoCloseBrackets: true,
    matchBrackets: true,
    autoRefresh: true,
    scrollbarStyle: 'overlay' as any,
    theme: storeState.app.theme && storeState.app.theme['dark-mode'] ? DARK_MODE_THEME : 'default'
  }
})

watch(
  () => props.modelValue,
  (val) => {
    if (cmInstance && val !== cmInstance.getValue()) {
      cmInstance.setValue(val)
      refresh()
    }
  }
)

watch(
  () => props.language,
  (val) => {
    if (cmInstance && val) {
      cmInstance.setOption('mode', val)
    }
  }
)

watch(
  () => storeState.app.theme,
  (val) => {
    if (cmInstance) {
      const dark = val && val['dark-mode']
      cmInstance.setOption('theme', dark ? DARK_MODE_THEME : 'default')
    }
  },
  { deep: true }
)

onMounted(() => {
  initialize()
})

onUnmounted(() => {
  if (cmInstance) {
    const element = cmInstance.getTextArea()
    element && element.remove && element.remove()
  }
})

const emit = defineEmits(['update:modelValue'])

const initialize = () => {
  const options = props.cmOptions ? merge({}, state.options, props.cmOptions) : state.options
  cmInstance = CodeMirror.fromTextArea(textarea.value, options)
  refresh()
  // change or blur
  cmInstance.on('blur', (cm) => {
    emit('update:modelValue', cm.getValue())
  })
}

const refresh = (w = '100%', h = '100%') => {
  nextFrame(() => {
    if (cmInstance) {
      cmInstance.setSize(w, h)
      cmInstance.refresh()
    }
  })
}

defineExpose({
  refresh
})
</script>

<style lang="scss">
@use 'src/assets/style/variable.scss' as *;

.fd-code-editor {
  display: flex;
  position: relative;
  width: 100%;
  overflow: hidden;

  .CodeMirror {
    flex: 1;
    text-align: left !important;
    font-size: var(--el-font-size-base);
    z-index: 1;
    background: none !important;

    .CodeMirror-code {
      line-height: 19px;
    }

    .CodeMirror-lines {
      padding: 4px 0;
    }

    .CodeMirror-overlayscroll-horizontal div,
    .CodeMirror-overlayscroll-vertical div {
      position: absolute;
      background: var(--el-scrollbar-bg-color, var(--el-text-color-secondary));
      opacity: var(--el-scrollbar-opacity, 0.3);
      &:hover {
        opacity: var(--el-scrollbar-hover-opacity, 0.5);
      }
    }

    .CodeMirror-overlayscroll-horizontal div {
      margin-bottom: 2px;
    }

    .CodeMirror-overlayscroll-vertical div {
      margin-right: 2px;
    }
  }

  &.bordered {
    border: 1px solid var(--el-border-color-base);
    border-radius: var(--el-border-radius-base);
  }
}
</style>
