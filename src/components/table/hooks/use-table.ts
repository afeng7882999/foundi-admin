import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus'
import { merge } from 'lodash-es'
import { Indexable } from '@/types/global'
import useFocusableRow, { FocusRowOption } from '@/components/table/hooks/use-focusable-row'
import useSettings, { TableSettingsOption } from '@/components/table/hooks/use-settings'
import useSortableRow, { SortableRowOption } from '@/components/table/hooks/use-sortable-row'

export type TableOption = FocusRowOption & TableSettingsOption & SortableRowOption

const useTable = (table: Ref<InstanceType<typeof ElTable>>, tableOption?: Partial<TableOption>) => {
  //===============================================================================
  // option
  //===============================================================================

  const defaultOption = {}

  const option = merge({}, defaultOption, tableOption)

  //===============================================================================
  // hooks
  //===============================================================================

  const result = {} as Indexable

  if (option.rowDraggable) {
    useSortableRow(table, option)
  }
  if (option.rowFocusable) {
    const { focusCurrentRow } = useFocusableRow(table, option)
    result.focusCurrentRow = focusCurrentRow
  }
  if (option.configurable) {
    const { columns, rowDensity, expandAll, stripe, border, tableAttrs } = useSettings(table, option)
    Object.assign(result, { columns, rowDensity, expandAll, stripe, border, tableAttrs })
  }

  return result
}

export default useTable
