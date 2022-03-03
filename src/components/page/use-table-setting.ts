import { TableColumn, TableSettingProp } from '@/components/table/types'
import { ExtractPropTypes, PropType, ref } from 'vue'

const useTableSetting = (props: Readonly<ExtractPropTypes<{ tableOption: PropType<TableSettingProp> }>>) => {
  const sortColumnDialog = ref()

  const expandAll = props.tableOption?.expandAll()
  const rowDensity = props.tableOption?.rowDensity()
  const columns = props.tableOption?.columns()
  const stripe = props.tableOption?.stripe()
  const border = props.tableOption?.border()

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
    toggleExpandAll,
    toggleStripe,
    toggleBorder,
    showSortColumnDialog,
    setTableColumns
  }
}

export default useTableSetting
