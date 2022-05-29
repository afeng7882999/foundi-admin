import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus'
import { computed, onMounted, onUpdated } from 'vue'
import { getDocumentTop, scrollDocH } from '@b/utils/smooth-scroll'
import usePage from '@/crud/hooks/use-page'
import { merge } from 'lodash-es'
import { unrefElement, useResizeObserver, VueInstance } from '@vueuse/core'

export type FocusRowOption = {
  // 行是否可选
  rowFocusable: boolean
}

const useFocusableRow = (table: Ref<InstanceType<typeof ElTable> | undefined>, focusRowOpt?: Partial<FocusRowOption>) => {
  //===============================================================================
  // option
  //===============================================================================

  const defaultOpt = {
    // 表格行是否可选
    rowFocusable: true
  }

  const option = merge({}, defaultOpt, focusRowOpt)

  //===============================================================================
  // ref
  //===============================================================================

  let colEl = null as HTMLElement | null
  let boxEl = null as HTMLElement | null
  let colRect = null as DOMRect | null

  const tableElCo = computed(() => {
    const wrapperEl = unrefElement(table as Ref<VueInstance>)
    return wrapperEl as HTMLElement
  })

  const bodyWrapperElCo = computed(() => {
    return tableElCo.value?.querySelector('.el-table__body-wrapper') as HTMLElement
  })

  //===============================================================================
  // row focus
  //===============================================================================

  // 插入focus边框
  const createHighlightBox = () => {
    if (!tableElCo.value || !bodyWrapperElCo.value) {
      return
    }
    boxEl = bodyWrapperElCo.value.querySelector('.row-focus-box') as HTMLElement
    if (!boxEl) {
      boxEl = document.createElement('div')
      boxEl.className = 'row-focus-box'
      tableElCo.value.appendChild(boxEl)
    } else {
      boxEl.className = 'row-focus-box'
    }
  }

  // 设置focus边框的位置和大小
  const resizeHighlightBox = (wrapperRect: DOMRectReadOnly) => {
    if (!boxEl || !bodyWrapperElCo.value) {
      return
    }
    colEl = bodyWrapperElCo.value.querySelector('tr.current-row') as HTMLElement
    if (colEl) {
      colRect = colEl.getBoundingClientRect()
      boxEl.style.top = colEl.offsetTop + bodyWrapperElCo.value.offsetTop - 1 + 'px'
      boxEl.style.left = bodyWrapperElCo.value.offsetLeft + 'px'
      boxEl.style.width = wrapperRect.width + 'px'
      boxEl.style.height = colRect.height + 1 + 'px'
      boxEl.style.display = 'block'
    } else {
      boxEl.style.display = 'none'
    }
  }

  const { getBodyHeight, getDocHeight } = usePage()

  // 滚动页面，使focus边框可见
  const scrollToHighlightBox = () => {
    if (colEl && colRect) {
      const bodyH = getBodyHeight(0) as number
      const titleH = bodyH - (getDocHeight(0) as number)
      if (colRect.top < titleH + colRect.height * 2) {
        scrollDocH(getDocumentTop() - (titleH + colRect.height * 2 - colRect.top), 0)
        return
      }
      if (colRect.top + colRect.height * 2 > bodyH) {
        scrollDocH(getDocumentTop() + (bodyH - colRect.top), 0)
        return
      }
    }
  }

  // 高亮当前选中表格行
  const focusCurrentRow = () => {
    if (!bodyWrapperElCo.value) {
      return
    }
    const wrapperRect = bodyWrapperElCo.value.getBoundingClientRect()
    resizeHighlightBox(wrapperRect)
    scrollToHighlightBox()
  }

  // 初始化高亮行
  const initFocusableRow = () => {
    if (option.rowFocusable && bodyWrapperElCo.value) {
      createHighlightBox()
      useResizeObserver(bodyWrapperElCo.value as HTMLElement, (entries) => {
        resizeHighlightBox(entries[0].contentRect)
      })
    }
  }

  //===============================================================================
  // life hooks
  //===============================================================================

  let rowFocusableInitialized = false

  const tryInit = () => {
    if (!rowFocusableInitialized) {
      initFocusableRow()
      rowFocusableInitialized = true
    }
  }

  onMounted(() => {
    tryInit()
  })

  onUpdated(() => {
    tryInit()
  })

  return {
    initFocusableRow,
    focusCurrentRow
  }
}

export default useFocusableRow
