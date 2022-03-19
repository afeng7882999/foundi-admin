import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus'
import { merge } from 'lodash-es'
import { Indexable } from '@/common/types'
import useFocusableRow, { FocusRowOption } from '@/extend/table/hooks/use-focusable-row'
import useSettings, { TableSettingsOption } from '@/extend/table/hooks/use-settings'
import useSortableRow, { SortableRowOption } from '@/extend/table/hooks/use-sortable-row'
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

  if (option.rowDraggable) {
    useSortableRow(table, option)
  }
  if (option.configurable) {
    const { columns, rowDensity, expandAll, stripe, border } = useSettings(table, option)
    Object.assign(result, { columns, rowDensity, expandAll, stripe, border })
  }

  if (option.rowFocusable) {
    const { focusCurrentRow } = useFocusableRow(table, option)
    result.focusCurrentRow = focusCurrentRow
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
