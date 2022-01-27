import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus'
import { addResizeListener, removeResizeListener, ResizableElement } from '@/utils/resize-event'
import './row-focus.css'
import { onMounted, onUnmounted, onUpdated } from 'vue'

const useRowFocus = (table: Ref<InstanceType<typeof ElTable>>, parent: Ref<HTMLElement | undefined>) => {
  let target = null as HTMLElement | null

  const resizeHighlightBox = () => {
    if (parent.value && target) {
      const col = target.querySelector('tr.current-row') as HTMLElement
      const box = parent.value.querySelector('.row-focus-box') as HTMLElement
      if (col) {
        const tableR = target.getBoundingClientRect()
        const rect = col.getBoundingClientRect()
        box.style.top = col.offsetTop + target.offsetTop - 1 + 'px'
        box.style.left = target.offsetLeft + 'px'
        box.style.width = tableR.width + 'px'
        box.style.height = rect.height + 1 + 'px'
        box.style.display = 'block'
      } else {
        box.style.display = 'none'
      }
    }
  }

  const bindHighlight = () => {
    if (parent && parent.value) {
      const table = parent.value?.querySelector('.el-table') as HTMLElement
      target = table.querySelector('.el-table__body-wrapper') as HTMLElement
      if (!target) {
        return
      }

      let box = parent.value.querySelector('.row-focus-box') as HTMLElement
      if (!box) {
        box = document.createElement('div')
        box.className = 'row-focus-box'
        table.appendChild(box)
      } else {
        box.className = 'row-focus-box'
      }

      addResizeListener(target as ResizableElement, resizeHighlightBox)
    }
  }

  onMounted(() => {
    bindHighlight()
  })

  onUnmounted(() => {
    if (target) {
      removeResizeListener(target as ResizableElement, resizeHighlightBox)
    }
  })

  const highlightCurrent = () => {
    resizeHighlightBox()
  }

  return {
    highlightCurrent
  }
}

export default useRowFocus
