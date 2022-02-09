import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus'
import { addResizeListener, removeResizeListener, ResizableElement } from '@/utils/resize-event'
import { computed, nextTick, onMounted, onUnmounted, reactive, unref } from 'vue'
import { getDocumentTop, scrollDocH } from '@/utils/smooth-scroll'
import usePage from '@/components/crud/use-page'
import { merge } from 'lodash-es'
import { TableColumnCtx } from 'element-plus/lib/components/table/src/table-column/defaults'
import { AnyObject } from '@/utils'
import Sortable, { SortableEvent } from 'sortablejs'
import { RowDensity, TABLE_ID_PREFIX } from '@/components/table/types'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { useRoute } from 'vue-router'
import { getPageIdFromRoute } from '@/utils/query'
import { addClass, removeClass } from '@/utils/dom'

export interface TableOption {
  // 数据
  data?: AnyObject[]
  // 行键值
  rowKey?: string
  // 是否是树表
  treeTable?: boolean
  // 树表缩进
  indent?: number
  // 表格是否可配置
  configurable?: boolean
  // 列可排序时表的别名
  alias?: string
  // 行是否可拖动
  rowDraggable?: boolean
  // 行拖动元素类名
  rowDragClass?: string
  // 行是否可选
  rowSelectable?: boolean

  // 选择项发生变化时
  onSelectionChange?: (selection: AnyObject[]) => void
  // 行被点击时
  onRowClick?: (row: AnyObject) => void
  // 勾选数据行的 Checkbox 时
  onSelect?: (selection: AnyObject[]) => void
  // 勾选全选 Checkbox 时
  onSelectAll?: (selection: AnyObject[]) => void
  // 行拖动完成时
  onRowDragEnd?: (e: SortableEvent) => void
}

export interface TableColumn {
  id: number
  visible: boolean
  property?: string
  label?: string
  type?: string
}

const useTable = (
  table: Ref<InstanceType<typeof ElTable> | undefined>,
  wrapper: Ref<HTMLElement | undefined>,
  tableOption?: TableOption
) => {
  //===============================================================================
  // option
  //===============================================================================

  const defaultOption = {
    // 表格行是否可选
    tableRowSelectable: false,
    // 表格是否可配置
    configurable: true,
    // 列可排序时表的别名
    alias: '_0',
    // 行是否可拖动
    rowDraggable: false,
    // 树表缩进
    indent: 15,
    // 行拖动元素类名
    rowDragClass: '.allowDrag'
  }

  const option = reactive(merge({}, defaultOption, tableOption))

  //===============================================================================
  // ref
  //===============================================================================

  let wrapperEl = null as HTMLElement | null
  let tableEl = null as HTMLElement | null
  let bodyWrapperEl = null as HTMLElement | null
  let colEl = null as HTMLElement | null
  let boxEl = null as HTMLElement | null
  let colRect = null as DOMRect | null

  //===============================================================================
  // draggable row
  //===============================================================================

  const initRowDrag = () => {
    if (!bodyWrapperEl) {
      return
    }
    const tBodyEl = bodyWrapperEl.querySelector('table > tbody') as HTMLElement
    Sortable.create(tBodyEl, {
      handle: option.rowDragClass,
      animation: 150,
      onEnd: option.onRowDragEnd
    })
  }

  //===============================================================================
  // row focus
  //===============================================================================

  // 插入focus边框
  const createHighlightBox = () => {
    if (!tableEl || !bodyWrapperEl) {
      return
    }
    boxEl = bodyWrapperEl.querySelector('.row-focus-box') as HTMLElement
    if (!boxEl) {
      boxEl = document.createElement('div')
      boxEl.className = 'row-focus-box'
      tableEl.appendChild(boxEl)
    } else {
      boxEl.className = 'row-focus-box'
    }
  }

  // 设置focus边框的位置和大小
  const resizeHighlightBox = () => {
    if (!wrapper.value || !bodyWrapperEl || !boxEl) {
      return
    }
    colEl = bodyWrapperEl.querySelector('tr.current-row') as HTMLElement
    if (colEl) {
      const wrapperRect = bodyWrapperEl.getBoundingClientRect()
      colRect = colEl.getBoundingClientRect()
      boxEl.style.top = colEl.offsetTop + bodyWrapperEl.offsetTop - 1 + 'px'
      boxEl.style.left = bodyWrapperEl.offsetLeft + 'px'
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
  const highlightCurrentRow = () => {
    resizeHighlightBox()
    scrollToHighlightBox()
  }

  //===============================================================================
  // configurable settings
  //===============================================================================

  const store = useStore<AllState>()
  const storeState = store.state as AllState
  const route = useRoute()

  // 表格ID
  const tableId = computed(() => {
    return TABLE_ID_PREFIX + getPageIdFromRoute(route) + option.alias
  })

  // 表格列数据
  const columns = computed({
    get: () => {
      const item = storeState.table.settings.find((s) => s.id === tableId.value)
      if (item && item.setting && item.setting.columns) {
        return item.setting.columns
      }
      return getColumnsFromTable()
    },
    set: async (columns) => {
      if (columns) {
        sortColumns(columns)
        await store.dispatch('table/setColumns', { id: tableId.value, columns })
      }
    }
  })

  // 表格行密度
  const rowDensity = computed({
    get: () => {
      const item = storeState.table.settings.find((s) => s.id === tableId.value)
      if (item && item.setting && item.setting.rowDensity) {
        return item.setting.rowDensity
      }
      return undefined
    },
    set: async (density) => {
      if (density) {
        changeRowDensity(density)
        await store.dispatch('table/setRowDensity', { id: tableId.value, rowDensity: density })
      }
    }
  })

  // 表格（树表）是否默认展开
  const expandAll = computed({
    get: () => {
      const item = storeState.table.settings.find((s) => s.id === tableId.value)
      if (item && item.setting && item.setting.expandAll) {
        return item.setting.expandAll
      }
      return undefined
    },
    set: async (expandAll) => {
      if (expandAll) {
        await store.dispatch('table/setExpandAll', { id: tableId.value, expandAll })
      }
    }
  })

  // 获取表格列数组
  const getColumnsFromTable = () => {
    if (!table || !table.value) {
      return
    }
    const cols = table.value.store.states._columns.value
    let i = 0
    return cols.map((item: TableColumnCtx<any>) => {
      return {
        id: i++,
        visible: true,
        property: item.property,
        label: item.label,
        type: item.type
      } as TableColumn
    })
  }

  // 重新排序表格列
  const sortColumns = (columns: TableColumn[]) => {
    if (!table || !table.value) {
      return
    }
    // 多级表头仅处理第一级
    const tableCols = table.value.store.states._columns.value as TableColumnCtx<any>[]
    const temp = [...tableCols]
    const visibleCols = columns.filter((c: TableColumn) => c.visible)
    for (let i = 0; i < temp.length; i++) {
      const idx = visibleCols.findIndex((c: TableColumn) => c.id === i)
      if (idx != -1) {
        tableCols[idx] = temp[i]
      }
    }
    tableCols.length = visibleCols.length
    table.value.store.updateColumns()
    nextTick(() => {
      if (table && table.value) {
        table.value.doLayout()
      }
    })
  }

  // 改变表格行密度
  const changeRowDensity = (density: RowDensity) => {
    if (wrapperEl) {
      if (density === 'high') {
        removeClass(wrapperEl, 'is-den-low')
        addClass(wrapperEl, 'is-den-high')
        return
      }
      if (density === 'low') {
        removeClass(wrapperEl, 'is-den-high')
        addClass(wrapperEl, 'is-den-low')
        return
      }
      removeClass(wrapperEl, 'is-den-low')
      removeClass(wrapperEl, 'is-den-high')
    }
  }

  // 根据配置初始化表格
  const initConfigurableTable = () => {
    const id = TABLE_ID_PREFIX + getPageIdFromRoute(route) + option.alias
    const item = storeState.table.settings.find((s) => s.id === id)
    if (item && item.setting) {
      item.setting.rowDensity && changeRowDensity(item.setting.rowDensity)
      item.setting.columns && sortColumns(item.setting.columns)
    }
  }

  //===============================================================================
  // life hooks
  //===============================================================================

  onMounted(() => {
    if (unref(wrapper)) {
      wrapperEl = wrapper.value as HTMLElement
      tableEl = wrapperEl?.querySelector('.el-table') as HTMLElement
      bodyWrapperEl = tableEl.querySelector('.el-table__body-wrapper') as HTMLElement
    }
    if (option.rowDraggable) {
      initRowDrag()
    }
    if (option.tableRowSelectable && bodyWrapperEl) {
      createHighlightBox()
      addResizeListener(bodyWrapperEl as ResizableElement, resizeHighlightBox)
    }
    if (option.configurable) {
      initConfigurableTable()
    }
  })

  onUnmounted(() => {
    if (option.tableRowSelectable && bodyWrapperEl) {
      removeResizeListener(bodyWrapperEl as ResizableElement, resizeHighlightBox)
    }
  })

  //===============================================================================
  // component default props
  //===============================================================================

  const tableAttrs = computed(() => {
    if (option.treeTable) {
      return {
        highlightCurrentRow: option.tableRowSelectable,
        data: option.data,
        rowKey: option.rowKey,
        defaultExpandAll: expandAll.value,
        indent: option.indent,
        onSelectionChange: option.onSelectionChange,
        onRowClick: option.onRowClick,
        onSelect: option.onSelect,
        onSelectAll: option.onSelectAll
      }
    } else {
      return {
        highlightCurrentRow: option.tableRowSelectable,
        data: option.data,
        rowKey: option.rowKey,
        onSelectionChange: option.onSelectionChange,
        onRowClick: option.onRowClick
      }
    }
  })

  return {
    tableAttrs,
    columns,
    rowDensity,
    expandAll,
    highlightCurrentRow
  }
}

export default useTable
