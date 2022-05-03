import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus'
import { computed, nextTick, onMounted, onUpdated } from 'vue'
import { cloneDeep, merge } from 'lodash-es'
import { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { RowDensity, TABLE_ID_PREFIX, TableColumn } from '../types'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { useRoute } from 'vue-router'
import { getPageIdFromRoute } from '@/utils/query'
import { TreeNode, traverseTree } from '@/utils/data-tree'
import { unrefElement, VueInstance } from '@vueuse/core'
import { ApiObj } from '@/api'
import { Indexable } from '@/common/types'
import { addClass, hasClass, removeClass } from '@/utils/dom'

export type TableSettingsOption = {
  // 数据
  data: () => ApiObj[]
  // 是否是树表
  treeTable: boolean
  // 是否可配置
  configurable: boolean
  // 表的别名（可配置时）
  alias: string
  // 是否默认展开（树表）
  defaultExpandAll: boolean
}

const useSettings = (table: Ref<InstanceType<typeof ElTable> | undefined>, tableSettingsOpt?: Partial<TableSettingsOption>) => {
  //===============================================================================
  // option
  //===============================================================================

  const defaultOpt = {
    // 是否可配置
    configurable: true,
    // 表的别名（可配置时）
    alias: '_0',
    // 是否默认展开（树表）
    defaultExpandAll: true
  }

  const option = merge({}, defaultOpt, tableSettingsOpt)

  //===============================================================================
  // ref
  //===============================================================================

  const tableElCo = computed(() => {
    const wrapperEl = unrefElement(table as Ref<VueInstance>)
    return wrapperEl as HTMLElement
  })

  //===============================================================================
  // table settings
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
      return option.defaultExpandAll
    },
    set: async (expandAll) => {
      if (expandAll !== null) {
        if (option.data) {
          const data = option.data() as TreeNode[]
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
        fixed: item.fixed,
        oldFixed: item.fixed
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
    const wrapperEl = tableElCo.value.parentElement
    if (wrapperEl && hasClass(wrapperEl, 'fd-page__table')) {
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

  let tableSettingInitialized = false

  const tryInit = () => {
    if (option.configurable && !tableSettingInitialized) {
      initConfigurableTable()
      tableSettingInitialized = true
    }
  }

  onMounted(() => {
    tryInit()
  })

  onUpdated(() => {
    tryInit()
  })

  //===============================================================================
  // table props
  //===============================================================================

  const tableAttrs = computed(() => {
    const result = {
      border: border.value
    } as Indexable
    if (option.treeTable) {
      result.defaultExpandAll = expandAll.value
    } else {
      result.stripe = stripe.value
    }

    return result
  })

  return {
    initConfigurableTable,
    columns,
    rowDensity,
    expandAll,
    stripe,
    border,
    tableAttrs
  }
}

export default useSettings
