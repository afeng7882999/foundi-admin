import { computed, nextTick, ref, unref, UnwrapRef } from 'vue'
import { merge } from 'lodash-es'
import { ElForm } from 'element-plus'
import useTable from '@/components/table/hooks/use-table'
import { traverseTree } from '@b/utils/data-tree'
import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus/es'
import { ApiObj, ApiQuery } from '@b/api'
import { Indexable } from '@b/common/types'
import baseUseList, { ListStateOption as BaseListStateOption, TreeStateOption, Refs as BaseRefs } from '@b/crud/hooks/use-list'

export type ListStateOption<T extends ApiObj> = Partial<{
  // 表头排序是否支持多字段
  sortMulti: boolean
  // 表格别名
  alias: string
  // 表格行是否可选
  tableRowSelectable: boolean
  // 行是否可拖动
  rowDraggable: boolean
}> &
  BaseListStateOption<T>

export type Refs<T extends ApiObj> = {
  queryForm: Ref<InstanceType<typeof ElForm>>
  table: Ref<InstanceType<typeof ElTable>>
} & BaseRefs<T>

export default function <T extends ApiObj>(stateOption: ListStateOption<T> | TreeStateOption<T>, refs?: Partial<Refs<T>>) {
  //===============================================================================
  // ref
  //===============================================================================

  const queryForm = refs?.queryForm ?? (ref() as Ref<InstanceType<typeof ElForm>>)
  const table = refs?.table ?? (ref() as Ref<InstanceType<typeof ElTable>>)

  //===============================================================================
  // state
  //===============================================================================

  const defaultState = {
    // 表头排序是否支持多字段
    sortMulti: false,
    // 表格行是否可选
    tableRowSelectable: false,
    // 表格别名
    alias: '_0',
    // 行是否可拖动
    rowDraggable: false
  }

  const listOption = merge({}, defaultState, stateOption)
  const { listRefs, listState, listMethods } = baseUseList(listOption, refs)

  //===============================================================================
  // tree table
  //===============================================================================

  // 树节点选中
  const onTreeSelect = (selection: T[]) => {
    if (selection.length > listState.selectedItems.length) {
      const selected = selection.filter(
        (item) => !unref<T[]>(listState.selectedItems).some((item2) => item2[listState.idField] === item[listState.idField])
      )
      traverseTree(
        selected,
        (item) => {
          table.value.toggleRowSelection(item, true)
          if (!unref<T[]>(listState.selectedItems).some((item2) => item2[listState.idField] === item[listState.idField])) {
            unref<T[]>(listState.selectedItems).push(item)
          }
        },
        listState.treeFields
      )
    } else {
      const selected = unref<T[]>(listState.selectedItems).filter(
        (item) => !selection.some((item2) => item2[listState.idField] === item[listState.idField])
      )
      traverseTree(
        selected,
        (item) => {
          table.value.toggleRowSelection(item, false)
          listState.selectedItems = unref<T[]>(listState.selectedItems).filter(
            (item2) => item2[listState.idField] !== item[listState.idField]
          )
        },
        listState.treeFields
      )
    }
  }

  // 树节点全选
  const onTreeSelectAll = (selection: T[]) => {
    onTreeSelect(selection)
  }

  //===============================================================================
  // grid layout
  //===============================================================================

  const toggleGridView = async () => {
    if (!listState.gridViewEnable) {
      return
    }

    // switch to table view
    if (listState.gridView) {
      listState.pageState.current = Math.floor(listState.gridFirstIndexInPage / listState.pageState.siz) + 1
      listState.selectedItems = []
      listState.gridView = false
      await nextTick(() => {
        initTable()
        listMethods.getList()
      })
      return
    }

    // switch to grid view
    listState.gridInitIndex = (listState.pageState.current - 1) * listState.pageState.siz
    listState.selectedItems = []
    listState.gridView = true
  }

  //===============================================================================
  // table
  //===============================================================================

  // 表格列内容空formatter
  const colEmptyFormatter = (row: any, column: any, cellValue: any) => {
    return cellValue ? cellValue : '无'
  }

  // 表格选择
  const tableSelectionChange = (val: T[]) => {
    listState.selectedItems = val
  }

  // 表格行点击
  const tableRowClick = (row: T) => {
    setFocusedItem(row)
  }

  // 设置当前行
  const setFocusedItem = (item: T | UnwrapRef<T> | undefined) => {
    if (listState.tableRowSelectable) {
      if (!item) {
        listState.focusedItem = undefined
      } else {
        listState.focusedItem = item
      }
      nextTick(() => {
        focusCurrentRow()
      })
    }
  }

  // use-table
  const {
    initTable,
    focusCurrentRow,
    columns,
    rowDensity,
    expandAll,
    stripe,
    border,
    tableAttrs: _tableAttrs
  } = useTable(table, {
    rowFocusable: listState.tableRowSelectable,
    rowDraggable: listState.rowDraggable,
    data: () => listState.data,
    treeTable: listState.treeTable,
    configurable: true,
    alias: listState.alias,
    defaultExpandAll: listState.defaultExpandAll
  })

  //===============================================================================
  // default attrs
  //===============================================================================

  // 详情对话框默认参数
  const detailAttrs = computed(() => {
    return {
      onOpenEditDialog: listMethods.showEdit
    }
  })

  // fd-page-main默认参数
  const pageMainAttrs = computed(() => {
    return {
      queryData: listState.query,
      'onUpdate:queryData': (val: ApiQuery) => (listState.query = val),
      queryVisible: listState.queryFormShow,
      'onUpdate:queryVisible': (val: boolean) => (listState.queryFormShow = val),
      queryFn: listMethods.queryList,
      gridView: listState.gridView,
      pagination: paginationAttrs.value
    }
  })

  // fd-page-toolbar默认参数
  const pageToolbarAttrs = computed(() => {
    return {
      queryData: listState.query,
      queryFn: listMethods.queryList,
      queryVisible: listState.queryFormShow,
      'onUpdate:queryVisible': (val: boolean) => (listState.queryFormShow = val),
      gridViewEnable: listState.gridViewEnable,
      gridView: listState.gridView,
      gridPage: { index: listState.gridFirstIndexInPage, total: listState.gridPageState.total },
      selectMode: listState.gridSelectMode,
      selectNumber: listState.selectedItems.length,
      onToggleGridView: toggleGridView,
      onToggleSelectMode: listMethods.toggleSelectMode,
      onCreate: listMethods.showEdit,
      onDel: listMethods.del,
      onExport: listMethods.exportData,
      onExportAll: listMethods.exportDataAll,
      tableSettingOption: {
        expandAll: () => expandAll,
        rowDensity: () => rowDensity,
        columns: () => columns,
        stripe: () => stripe,
        border: () => border
      },
      pagination: paginationAttrs.value
    }
  })

  // el-table默认参数
  const tableAttrs = computed(() => {
    const result = {
      highlightCurrentRow: _tableAttrs.value.highlightCurrentRow,
      data: listState.data,
      rowKey: listState.idField,
      border: _tableAttrs.value.border,
      stripe: _tableAttrs.value.stripe,
      onSelectionChange: tableSelectionChange,
      onRowClick: tableRowClick
    } as Indexable
    if (stateOption.treeTable) {
      result.defaultExpandAll = _tableAttrs.value.defaultExpandAll
      result.indent = 15
      result.onSelect = onTreeSelect
      result.onSelectAll = onTreeSelectAll
    }
    return result
  })

  // el-pagination默认参数
  const paginationAttrs = computed(() => {
    return {
      background: 'background',
      currentPage: listState.pageState.current,
      pageCount: listState.pageState.count,
      pageSize: listState.pageState.siz,
      pageSizes: [10, 15, 20, 50, 100, 200],
      total: listState.pageState.total,
      layout: 'total, sizes, prev, pager, next, jumper',
      onCurrentChange: listMethods.pageChange,
      onSizeChange: listMethods.sizeChange
    }
  })

  // grid视图下，el-pagination默认参数
  const gridPaginationAttrs = computed(() => {
    return {
      background: 'background',
      small: true,
      currentPage: listState.gridPageState.current,
      pageCount: listState.gridPageState.count,
      pageSize: listState.gridPageState.scrollSiz,
      pageSizes: [20, 50, 100, 200],
      total: listState.gridPageState.total,
      pagerCount: 5,
      layout: 'sizes, prev, pager, next',
      onCurrentChange: listMethods.gridPageChange,
      onSizeChange: listMethods.gridPageSizeChange
    }
  })

  // fd-virtual-grid默认参数
  const gridAttrs = computed(() => {
    return {
      length: listState.gridPageState.total,
      pageSize: listState.gridPageState.siz,
      scrollPageSize: listState.gridPageState.scrollSiz,
      initIndex: listState.gridInitIndex,
      pageProvider: listMethods.pageProvider,
      windowMode: false,
      isMobile: false,
      loadingWait: listState.loadingWait,
      onOffsetChanged: listMethods.gridOffsetChanged,
      onBufferRefreshed: listMethods.gridBufferRefreshed
    }
  })

  // fd-default-card默认参数
  const cardAttrs = computed(() => {
    return {
      dicts: listState.dicts,
      focusedIndex: listState.gridFocusIndex,
      selectMode: listState.gridSelectMode,
      selectedItems: listState.selectedItems,
      isMobile: false,
      onDetail: listMethods.gridShowDetail,
      onDel: listMethods.del,
      onSelect: listMethods.gridSelected
    }
  })

  return {
    listRefs: {
      queryForm,
      table,
      ...listRefs
    },
    listState,
    listComputed: {
      columns,
      rowDensity,
      expandAll,
      stripe,
      border
    },
    listMethods: {
      ...listMethods,
      colEmptyFormatter,
      tableSelectionChange,
      tableRowClick
    },
    listAttrs: {
      pageMainAttrs,
      tableAttrs,
      paginationAttrs,
      gridPaginationAttrs,
      detailAttrs,
      pageToolbarAttrs,
      gridAttrs,
      cardAttrs
    }
  }
}
