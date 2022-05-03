import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus'
import { computed, onMounted, onUnmounted, onUpdated } from 'vue'
import { merge } from 'lodash-es'
import Sortable, { SortableEvent } from 'sortablejs'
import { unrefElement, VueInstance } from '@vueuse/core'
import { ApiObj } from '@/api'

export type SortableRowOption = {
  // 数据
  data: () => ApiObj[]
  // 行是否可拖动
  rowDraggable: boolean
  // 行拖动元素类名（可拖动时）
  rowDragClass: string
  // 数据排序字段（可拖动时）
  sortField: string
  // 行拖动完成时（可拖动时）
  onRowDragEnd: (e: SortableEvent) => void
}

const useSortableRow = (table: Ref<InstanceType<typeof ElTable> | undefined>, sortableRowOpt?: Partial<SortableRowOption>) => {
  //===============================================================================
  // option
  //===============================================================================

  const defaultOpt = {
    // 行是否可拖动
    rowDraggable: true,
    // 数据排序字段（可拖动时）
    sortField: 'sort',
    // 行拖动元素类名（可拖动时）
    rowDragClass: '.sortable-drag'
  }

  const option = merge({}, defaultOpt, sortableRowOpt)

  //===============================================================================
  // ref
  //===============================================================================

  const tableElCo = computed(() => {
    const wrapperEl = unrefElement(table as Ref<VueInstance>)
    return wrapperEl as HTMLElement
  })

  const bodyWrapperElCo = computed(() => {
    return tableElCo.value?.querySelector('.el-table__body-wrapper') as HTMLElement
  })

  //===============================================================================
  // draggable row
  //===============================================================================

  // 排序行数据
  const _onRowDragEnd = (e: SortableEvent) => {
    if (option.data) {
      const data = option.data()
      const targetRow = data.splice(e.oldIndex as number, 1)[0]
      data.splice(e.newIndex as number, 0, targetRow)
      if (option.sortField) {
        for (let i = 0; i < data.length; i++) {
          data[i][option.sortField] = i + 1
        }
      }
    }
    option.onRowDragEnd && option.onRowDragEnd(e)
  }

  let sortable = null as Sortable | null

  // 初始化可拖动行
  const initRowDrag = () => {
    if (!bodyWrapperElCo.value) {
      return
    }
    const tBodyEl = bodyWrapperElCo.value.querySelector('table > tbody') as HTMLElement
    sortable = Sortable.create(tBodyEl, {
      handle: option.rowDragClass,
      animation: 150,
      onEnd: _onRowDragEnd
    })
  }

  //===============================================================================
  // life hooks
  //===============================================================================

  let rowDragInitialized = false

  const tryInit = () => {
    if (option.rowDraggable && bodyWrapperElCo.value && !rowDragInitialized) {
      initRowDrag()
      rowDragInitialized = true
    }
  }

  onMounted(() => {
    tryInit()
  })

  onUpdated(() => {
    tryInit()
  })

  onUnmounted(() => {
    sortable?.destroy()
  })

  return {
    initRowDrag
  }
}

export default useSortableRow
