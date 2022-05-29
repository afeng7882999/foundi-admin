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
import { merge } from 'lodash-es'
import { nextFrame } from '@b/utils/next-frame'
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
import { DARK_MODE_THEME } from '@b/components/code-editor/code-editor'

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
  disabled: {
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
  },
  dark: {
    type: Boolean,
    default: false
  }
})

const textarea = ref()
let cmInstance = null as EditorFromTextArea | null

const state = reactive({
  cmValue: props.modelValue,
  options: {
    mode: props.language ? props.language : 'javascript',
    smartIndent: true,
    tabSize: 2,
    lineNumbers: props.lineNumbers,
    readOnly: (props.readonly || props.disabled ? 'nocursor' : false) as any,
    autoCloseBrackets: true,
    matchBrackets: true,
    autoRefresh: true,
    scrollbarStyle: 'overlay' as any,
    theme: props.dark ? DARK_MODE_THEME : 'default'
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
  () => props.dark,
  (val) => {
    if (cmInstance) {
      cmInstance.setOption('theme', val ? DARK_MODE_THEME : 'default')
    }
  },
  { deep: true }
)

watch(
  () => props.disabled,
  (val) => {
    if (cmInstance) {
      if (val) {
        cmInstance.setOption('readOnly', 'nocursor')
      } else {
        cmInstance.setOption('readOnly', false)
      }
    }
  }
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
