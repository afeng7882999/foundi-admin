import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus'
import { addResizeListener, removeResizeListener, ResizableElement } from '@/utils/resize-event'
import { computed, nextTick, onMounted, onUnmounted, onUpdated } from 'vue'
import { getDocumentTop, scrollDocH } from '@/utils/smooth-scroll'
import usePage from '@/components/crud/use-page'
import { cloneDeep, merge } from 'lodash-es'
import { TableColumnCtx } from 'element-plus/lib/components/table/src/table-column/defaults'
import { AnyObject } from '@/utils'
import Sortable, { SortableEvent } from 'sortablejs'
import { RowDensity, TABLE_ID_PREFIX, TableColumn } from '@/components/table/types'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { useRoute } from 'vue-router'
import { getPageIdFromRoute } from '@/utils/query'
import { addClass, removeClass } from '@/utils/dom'
import { ITreeNode, traverseTree } from '@/utils/data-tree'

export interface TableOption {
  // 数据
  data?: () => AnyObject[]
  // 行键值
  rowKey?: string

  // 是否是树表
  treeTable?: boolean
  // 缩进（树表）
  indent?: number

  // 是否可配置
  configurable?: boolean
  // 表的别名（可配置时）
  alias?: string

  // 行是否可选
  rowSelectable?: boolean

  // 行是否可拖动
  rowDraggable?: boolean
  // 行拖动元素类名（可拖动时）
  rowDragClass?: string
  // 数据排序字段（可拖动时）
  sortField?: string
  // 行拖动完成时（可拖动时）
  onRowDragEnd?: (e: SortableEvent) => void

  // 选择项发生变化时
  onSelectionChange?: (selection: AnyObject[]) => void
  // 行被点击时
  onRowClick?: (row: AnyObject) => void
  // 勾选数据行的 Checkbox 时
  onSelect?: (selection: AnyObject[]) => void
  // 勾选全选 Checkbox 时
  onSelectAll?: (selection: AnyObject[]) => void
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
    // 行键值
    rowKey: 'id',
    // 表格行是否可选
    rowSelectable: false,
    // 树表缩进
    indent: 15,
    // 是否可配置
    configurable: true,
    // 表的别名（可配置时）
    alias: '_0',
    // 行是否可拖动
    rowDraggable: false,
    // 数据排序字段（可拖动时）
    sortField: 'sort',
    // 行拖动元素类名（可拖动时）
    rowDragClass: '.sortable-drag'
  }

  const option = merge({}, defaultOption, tableOption)

  //===============================================================================
  // ref
  //===============================================================================

  let colEl = null as HTMLElement | null
  let boxEl = null as HTMLElement | null
  let colRect = null as DOMRect | null

  const tableElCo = computed(() => {
    const wrapperEl = wrapper.value as HTMLElement
    return wrapperEl?.querySelector('.el-table') as HTMLElement
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

  // 初始化可拖动行
  const initRowDrag = () => {
    if (!bodyWrapperElCo.value) {
      return
    }
    const tBodyEl = bodyWrapperElCo.value.querySelector('table > tbody') as HTMLElement
    Sortable.create(tBodyEl, {
      handle: option.rowDragClass,
      animation: 150,
      onEnd: _onRowDragEnd
    })
  }

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
  const resizeHighlightBox = () => {
    if (!wrapper.value || !bodyWrapperElCo.value || !boxEl) {
      return
    }
    colEl = bodyWrapperElCo.value.querySelector('tr.current-row') as HTMLElement
    if (colEl) {
      const wrapperRect = bodyWrapperElCo.value.getBoundingClientRect()
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

  let _originalColumns = [] as TableColumnCtx<any>[]

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
        await sortColumns(columns)
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
      return null
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
      if (item && item.setting && item.setting.expandAll !== null) {
        return item.setting.expandAll as boolean
      }
      return null
    },
    set: async (expandAll) => {
      if (expandAll !== null) {
        if (option.data) {
          const data = option.data() as ITreeNode[]
          traverseTree(data, (d) => {
            ;(table.value as InstanceType<typeof ElTable>).toggleRowExpansion(d, expandAll)
          })
          await store.dispatch('table/setExpandAll', { id: tableId.value, expandAll })
        }
      }
    }
  })

  // 表格是否显示斑马纹
  const stripe = computed({
    get: () => {
      const item = storeState.table.settings.find((s) => s.id === tableId.value)
      if (item && item.setting && item.setting.stripe !== null) {
        return item.setting.stripe as boolean
      }
      return null
    },
    set: async (stripe) => {
      if (stripe !== null) {
        await store.dispatch('table/setStripe', { id: tableId.value, stripe })
      }
    }
  })

  // 表格是否显示竖边框
  const border = computed({
    get: () => {
      const item = storeState.table.settings.find((s) => s.id === tableId.value)
      if (item && item.setting && item.setting.border !== null) {
        return item.setting.border as boolean
      }
      return null
    },
    set: async (border) => {
      if (border != null) {
        await store.dispatch('table/setBorder', { id: tableId.value, border })
        if (option.rowSelectable) {
          await nextTick(() => {
            highlightCurrentRow()
          })
        }
      }
    }
  })

  // 获取表格列数组
  const getColumnsFromTable = (): TableColumn[] | null => {
    if (!table || !table.value) {
      return null
    }
    const cols = table.value.store.states._columns.value
    let i = 0
    return cols.map((item: TableColumnCtx<any>) => {
      return {
        id: i++,
        visible: true,
        property: item.property,
        label: item.label,
        type: item.type,
        fixed: item.fixed
      } as TableColumn
    })
  }

  // 重新排序表格列
  const sortColumns = async (columns: TableColumn[]) => {
    if (!table || !table.value) {
      return
    }
    // 多级表头仅处理第一级
    const tableCols = [] as TableColumnCtx<any>[]
    const visibleCols = columns.filter((c: TableColumn) => c.visible)
    for (let i = 0; i < _originalColumns.length; i++) {
      const idx = visibleCols.findIndex((c: TableColumn) => c.id === i)
      if (idx != -1) {
        tableCols[idx] = _originalColumns[i]
        if (visibleCols[idx].fixed !== undefined) {
          tableCols[idx].fixed = visibleCols[idx].fixed as boolean | string
        }
      }
    }
    tableCols.length = visibleCols.length
    table.value.store.states._columns.value = tableCols
    table.value.store.updateColumns()
    await nextTick(() => {
      if (table && table.value) {
        table.value.doLayout()
      }
    })
  }

  // 改变表格行密度
  const changeRowDensity = (density: RowDensity) => {
    const wrapperEl = wrapper.value as HTMLElement
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
    if (!table || !table.value) {
      return
    }
    _originalColumns = cloneDeep(table.value.store.states._columns.value as TableColumnCtx<any>[])
    const item = storeState.table.settings.find((s) => s.id === tableId.value)
    if (item && item.setting) {
      item.setting.rowDensity && changeRowDensity(item.setting.rowDensity)
      item.setting.columns && sortColumns(item.setting.columns)
    }
  }

  //===============================================================================
  // life hooks
  //===============================================================================

  let rowDragInitialized = false
  let rowSelectableInitialized = false
  let configurableInitialized = false

  const tryInit = () => {
    if (option.rowDraggable && bodyWrapperElCo.value && !rowDragInitialized) {
      initRowDrag()
      rowDragInitialized = true
    }
    if (option.rowSelectable && bodyWrapperElCo.value && !rowSelectableInitialized) {
      createHighlightBox()
      addResizeListener(bodyWrapperElCo.value as ResizableElement, resizeHighlightBox)
      rowSelectableInitialized = true
    }
    if (option.configurable && !configurableInitialized) {
      initConfigurableTable()
      configurableInitialized = true
    }
  }

  onMounted(() => {
    tryInit()
  })

  onUpdated(() => {
    tryInit()
  })

  onUnmounted(() => {
    if (option.rowSelectable && bodyWrapperElCo.value) {
      removeResizeListener(bodyWrapperElCo.value as ResizableElement, resizeHighlightBox)
    }
  })

  //===============================================================================
  // component default props
  //===============================================================================

  const tableAttrs = computed(() => {
    const result = {
      highlightCurrentRow: option.rowSelectable,
      rowKey: option.rowKey,
      border: border.value
    } as AnyObject

    option.data && (result.data = option.data())
    option.onSelectionChange && (result.onSelectionChange = option.onSelectionChange)
    option.onRowClick && (result.onRowClick = option.onRowClick)

    if (option.treeTable) {
      result.defaultExpandAll = expandAll.value
      result.indent = option.indent
      option.onSelect && (result.onSelect = option.onSelect)
      option.onSelectAll && (result.onSelectAll = option.onSelectAll)
    } else {
      result.stripe = stripe.value
    }

    return result
  })

  return {
    tableAttrs,
    columns,
    rowDensity,
    expandAll,
    stripe,
    border,
    highlightCurrentRow
  }
}

export default useTable
