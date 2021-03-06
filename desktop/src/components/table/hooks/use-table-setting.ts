import { RowDensity, TableColumn, TableSettingProp } from '../types'
import { ref } from 'vue'

const useTableSetting = (tableSettingOption: TableSettingProp) => {
  const sortColumnDialog = ref()

  const expandAll = tableSettingOption.expandAll()
  const rowDensity = tableSettingOption.rowDensity()
  const columns = tableSettingOption.columns()
  const stripe = tableSettingOption.stripe()
  const border = tableSettingOption.border()

  const setRowDensity = (density: RowDensity) => {
    rowDensity != undefined && (rowDensity.value = density)
  }

  const toggleExpandAll = () => {
    expandAll !== undefined && (expandAll.value = !expandAll.value)
  }

  const toggleStripe = () => {
    stripe !== undefined && (stripe.value = !stripe.value)
  }

  const toggleBorder = () => {
    border !== undefined && (border.value = !border.value)
  }

  const showSortColumnDialog = () => {
    if (columns?.value) {
      sortColumnDialog.value.open(columns?.value)
    }
  }

  const setTableColumns = (cols: TableColumn[]) => {
    columns !== undefined && (columns.value = cols)
  }

  return {
    sortColumnDialog,
    expandAll,
    rowDensity,
    columns,
    stripe,
    border,
    setRowDensity,
    toggleExpandAll,
    toggleStripe,
    toggleBorder,
    showSortColumnDialog,
    setTableColumns
  }
}

export default useTableSetting
