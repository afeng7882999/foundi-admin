import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus'
import { addResizeListener, removeResizeListener, ResizableElement } from '@/utils/resize-event'
import './row-focus.css'
import { onMounted, onUnmounted } from 'vue'
import { getDocumentTop, scrollDocH } from '@/utils/smooth-scroll'
import usePage from '@/components/crud/use-page'

const useRowFocus = (table: Ref<InstanceType<typeof ElTable>>, parent: Ref<HTMLElement | undefined>) => {
  let wrapper = null as HTMLElement | null
  let col = null as HTMLElement | null
  let box = null as HTMLElement | null
  let colRect = null as DOMRect | null

  const { getBodyHeight, getDocHeight } = usePage()

  const createBox = (el: HTMLElement) => {
    const table = el?.querySelector('.el-table') as HTMLElement
    wrapper = table.querySelector('.el-table__body-wrapper') as HTMLElement
    if (!wrapper) {
      return
    }
    box = el.querySelector('.row-focus-box') as HTMLElement
    if (!box) {
      box = document.createElement('div')
      box.className = 'row-focus-box'
      table.appendChild(box)
    } else {
      box.className = 'row-focus-box'
    }
  }

  const resizeHighlightBox = () => {
    if (!parent.value || !wrapper || !box) {
      return
    }
    col = wrapper.querySelector('tr.current-row') as HTMLElement
    if (col) {
      const wrapperRect = wrapper.getBoundingClientRect()
      colRect = col.getBoundingClientRect()
      box.style.top = col.offsetTop + wrapper.offsetTop - 1 + 'px'
      box.style.left = wrapper.offsetLeft + 'px'
      box.style.width = wrapperRect.width + 'px'
      box.style.height = colRect.height + 1 + 'px'
      box.style.display = 'block'
    } else {
      box.style.display = 'none'
    }
  }

  const scrollToHighlightBox = () => {
    if (col && colRect) {
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

  onMounted(() => {
    if (parent && parent.value) {
      createBox(parent.value as HTMLElement)
      addResizeListener(wrapper as ResizableElement, resizeHighlightBox)
    }
  })

  onUnmounted(() => {
    if (wrapper) {
      removeResizeListener(wrapper as ResizableElement, resizeHighlightBox)
    }
  })

  const highlightCurrent = () => {
    resizeHighlightBox()
    scrollToHighlightBox()
  }

  return {
    highlightCurrent
  }
}

export default useRowFocus
