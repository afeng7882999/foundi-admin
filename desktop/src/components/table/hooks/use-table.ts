import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus'
import { merge } from 'lodash-es'
import { AnyFunction, Indexable } from '@b/common/types'
import useFocusableRow, { FocusRowOption } from '../hooks/use-focusable-row'
import useSettings, { TableSettingsOption } from '../hooks/use-settings'
import useSortableRow, { SortableRowOption } from '../hooks/use-sortable-row'
import { computed } from 'vue'

export type TableOption = FocusRowOption & TableSettingsOption & SortableRowOption

const useTable = (table: Ref<InstanceType<typeof ElTable> | undefined>, tableOption?: Partial<TableOption>) => {
  //===============================================================================
  // option
  //===============================================================================

  const defaultOption = {
    rowDraggable: false,
    rowFocusable: true,
    configurable: true
  }

  const option = merge({}, defaultOption, tableOption)

  //===============================================================================
  // hooks
  //===============================================================================

  const result = {} as Indexable
  let initRowDragFn = undefined as AnyFunction | undefined
  let initConfigurableTableFn = undefined as AnyFunction | undefined
  let initFocusableRowFn = undefined as AnyFunction | undefined

  if (option.rowDraggable) {
    const { initRowDrag } = useSortableRow(table, option)
    initRowDragFn = initRowDrag
  }
  if (option.configurable) {
    const { initConfigurableTable, columns, rowDensity, expandAll, stripe, border } = useSettings(table, option)
    Object.assign(result, { columns, rowDensity, expandAll, stripe, border })
    initConfigurableTableFn = initConfigurableTable
  }

  if (option.rowFocusable) {
    const { initFocusableRow, focusCurrentRow } = useFocusableRow(table, option)
    result.focusCurrentRow = focusCurrentRow
    initFocusableRowFn = initFocusableRow
  }

  result.initTable = () => {
    initRowDragFn?.()
    initConfigurableTableFn?.()
    initFocusableRowFn?.()
  }

  //===============================================================================
  // table props
  //===============================================================================

  result.tableAttrs = computed(() => {
    const attrs = {} as Indexable

    if (option.configurable) {
      attrs.border = result.border.value
      if (option.treeTable) {
        attrs.defaultExpandAll = result.expandAll.value
      } else {
        attrs.stripe = result.stripe.value
      }
    }

    if (option.rowFocusable) {
      attrs.highlightCurrentRow = true
    }

    return attrs
  })

  return result
}

export default useTable
