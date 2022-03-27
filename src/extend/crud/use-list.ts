import { computed, nextTick, onMounted, reactive, ref, unref } from 'vue'
import { isString, merge } from 'lodash-es'
import { ElForm, ElMessage, ElMessageBox } from 'element-plus'
import useDict from './use-dict'
import { scrollDocToTop } from '@/utils/smooth-scroll'
import { nextFrame } from '@/utils/next-frame'
import useTable from '@/extend/table/hooks/use-table'
import { arrayToTree, getTreeNode, getTreeNodes, TreeFields, traverseTree } from '@/utils/data-tree'
import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus/es'
import { DetailDialog } from '@/extend/crud/use-detail'
import { EditDialog } from '@/extend/crud/use-edit'
import { ApiObj, ApiQuery, ExportRange } from '@/api'
import { DictList } from '@/api/system/dict-item'
import { AnyFunction, Indexable } from '@/common/types'
import { MaybeRef, useThrottleFn } from '@vueuse/core'

export type ListStateOption<T extends ApiObj> = Partial<{
  // 是否是树表
  treeTable: boolean
  // 主键
  idField: string
  // 表格数据
  data: MaybeRef<T[]>
  // 字典
  dicts: DictList
  // 获取数据的固定参数
  params: ApiQuery
  // 查询数据的对象
  query: ApiQuery
  // 表头排序是否支持多字段
  sortMulti: boolean
  // 每页数据条数
  siz: number
  // 导出Excel文件名前缀
  exportTitle: string
  // 等待时间
  waitAfterGet: number
  // 表格别名
  alias: string
  // 表格行是否可选
  tableRowSelectable: boolean
  // 行是否可拖动
  rowDraggable: boolean
  // 删除数据的api
  delApi: AnyFunction
  // 导出数据的api
  exportApi: AnyFunction

  [key: string]: any
}> & {
  // 请求数据列表的api
  listApi: AnyFunction
}

export type TreeStateOption<T extends ApiObj> = ListStateOption<T> &
  Partial<{
    // 树表字段
    treeFields: TreeFields
    // 默认展开所有树
    defaultExpandAll: boolean
    // 根节点名称
    rootName: string
  }>

export type Refs<T extends ApiObj> = {
  queryForm: Ref<InstanceType<typeof ElForm>>
  table: Ref<InstanceType<typeof ElTable>>
  editDialog: Ref<EditDialog>
  detailDialog: Ref<DetailDialog<T>>
}

export default function <T extends ApiObj>(stateOption: ListStateOption<T> | TreeStateOption<T>, refs?: Partial<Refs<T>>) {
  //===============================================================================
  // ref
  //===============================================================================

  const queryForm = refs?.queryForm ?? (ref() as Ref<InstanceType<typeof ElForm>>)
  const table = refs?.table ?? (ref() as Ref<InstanceType<typeof ElTable>>)
  const editDialog = refs?.editDialog ?? (ref() as Ref<EditDialog>)
  const detailDialog = refs?.detailDialog ?? (ref() as Ref<DetailDialog<T>>)

  //===============================================================================
  // state
  //===============================================================================

  const defaultState = {
    // 主键
    idField: 'id',
    // 表格数据
    data: [] as MaybeRef<T[]>,
    // 字典
    dicts: {} as DictList,
    // 获取数据的固定参数
    params: {} as ApiQuery,
    // 查询数据的对象
    query: {
      sort: []
    } as ApiQuery,
    // 表头排序是否支持多字段
    sortMulti: false,
    // 当前ID
    currentId: '',
    // 页码
    current: 0,
    // 每页数据条数
    siz: 20,
    // 总页数
    total: 0,
    // 数据总数
    count: 0,
    // 导出Excel文件名前缀
    exportTitle: '导出',
    // 等待时间
    waitAfterGet: 50,
    // 导出的 Loading
    exportLoading: false,
    // 表格 Loading 属性
    loading: true,
    // 表格行是否可选
    tableRowSelectable: false,
    // 删除 Loading 属性
    delLoading: false,
    // 选择的项目
    selectedNodes: [] as T[],
    // 弹窗属性
    editShow: false,
    // detail dialog visible
    detailShow: false,
    // 是否显示查询表单
    queryFormShow: false,
    // 表格别名
    alias: '_0',
    // 行是否可拖动
    rowDraggable: false
  }

  const defaultTreeState = {
    ...defaultState,
    // 是否是树表
    treeTable: true,
    // 树表字段
    treeFields: {
      // 编码字段
      idField: 'id',
      // 树名称字段
      labelField: 'name',
      // 父字段
      parentIdField: 'parentId',
      // 排序字段
      sortField: 'sort',
      // 下级字段
      childrenField: 'children'
    } as Partial<TreeFields>,
    // 默认展开所有树
    defaultExpandAll: true,
    // 选择的树节点
    selectedNodes: [] as T[],
    // 根节点名称
    rootName: '根节点'
  }

  const mixState = stateOption.treeTable
    ? reactive(merge({}, defaultTreeState, stateOption) as typeof defaultTreeState & TreeStateOption<T>)
    : reactive(merge({}, defaultState, stateOption) as typeof defaultState & ListStateOption<T>)

  //===============================================================================
  // handler
  //===============================================================================

  const mixHandlers = {
    // 获取数据列表之前
    beforeGetList: [
      async () => {
        return true
      }
    ],
    // 获取数据列表之后
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    afterGetList: [
      async (resData: Indexable) => {
        return
      }
    ],
    // 删除之前
    beforeDel: [
      async () => {
        return true
      }
    ],
    // 删除之后
    afterDel: [
      async () => {
        return
      }
    ]
  }

  // 获取数据列表之前
  const onBeforeGetList = (fn: () => Promise<boolean>) => {
    mixHandlers.beforeGetList.push(fn)
  }

  // 获取数据列表之后
  const onAfterGetList = (fn: (resData: Indexable) => Promise<void>) => {
    mixHandlers.afterGetList.push(fn)
  }

  // 删除之前
  const onBeforeDel = (fn: () => Promise<boolean>) => {
    mixHandlers.beforeDel.push(fn)
  }

  // 删除之后
  const onAfterDel = (fn: () => Promise<void>) => {
    mixHandlers.afterDel.push(fn)
  }

  //===============================================================================
  // list
  //===============================================================================

  // 字典方法
  const { getDictData, dictVal } = useDict(mixState.dicts)

  // 获取数据列表
  const getList = async () => {
    if (!mixState.listApi) {
      return
    }
    for (const fn of mixHandlers.beforeGetList) {
      if (!(await fn?.())) {
        return
      }
    }
    try {
      mixState.loading = true
      await getDictData()
      const query = getQueryParam()
      const { data, total, count, resData } = await mixState.listApi(query)
      if (stateOption.treeTable) {
        setTreeData(data)
      } else {
        mixState.total = total
        mixState.count = count
        mixState.data = data
      }
      mixState.selectedNodes = []
      for (const fn of mixHandlers.afterGetList) {
        await fn?.(resData)
      }
      if (mixState.tableRowSelectable && mixState.currentId) {
        setCurrentData(mixState.currentId)
      }
      setTimeout(() => {
        mixState.loading = false
      }, mixState.waitAfterGet)
    } catch (e) {
      mixState.loading = false
      console.log(e)
    }
  }

  // 显示页面即获取数据
  onMounted(async () => {
    mixState.loading = true
    await nextFrame(async () => {
      await getList()
    })
  })

  //===============================================================================
  // query
  //===============================================================================

  // 构造查询参数和分页
  const getQueryParam = () => {
    if (stateOption.treeTable) {
      return {
        ...mixState.query,
        ...mixState.params
      }
    }

    const orderByList = [] as string[]
    if (mixState.query.sort) {
      mixState.query.sort.forEach((s) => {
        orderByList.push(`${s.prop}:${s.order}`)
      })
    }

    return {
      current: mixState.current,
      size: mixState.siz,
      ...mixState.params,
      ...mixState.query,
      orderByList
    }
  }

  // 查询方法
  const queryList = async () => {
    mixState.current = 0
    await getList()
  }

  // 重置查询
  const resetQuery = async () => {
    mixState.query.sort = []
    await queryList()
  }

  // 表格排序
  const sortChanged = async ({ prop, order }: { prop: string; order: 'asc' | 'desc' | 'none' }) => {
    if (!prop || !order) {
      return
    }

    if (order === 'none') {
      mixState.query.sort = mixState.query.sort?.filter((f) => f.prop !== prop)
      await getList()
      return
    }

    const o = order as 'asc' | 'desc'
    if (mixState.sortMulti) {
      const field = mixState.query.sort?.find((s) => s.prop === prop)
      if (field) {
        field.order = o
      } else {
        mixState.query.sort?.push({ prop, order: o })
      }
      await getList()
      return
    }

    mixState.query.sort = [{ prop, order: o }]
    await getList()
  }

  //===============================================================================
  // page
  //===============================================================================

  // 改变页码
  const pageChange = async (val: number) => {
    mixState.current = val
    await getList()
    scrollDocToTop()
  }

  // 改变每页显示数
  const sizeChange = async (val: number) => {
    mixState.current = 0
    mixState.siz = val
    await getList()
    scrollDocToTop()
  }

  //===============================================================================
  // tree table
  //===============================================================================

  // 处理树状数据
  const setTreeData = (data: any[]) => {
    const treeData = arrayToTree(data, mixState.treeFields)
    mixState.data = traverseTree(
      treeData,
      (item) => {
        const node = getTreeNode(
          treeData,
          (n) => n[mixState.treeFields.idField as string] === item[mixState.treeFields.parentIdField as string],
          mixState.treeFields
        )
        item.parentName = node ? node.name : mixState.rootName
      },
      mixState.treeFields
    )
  }

  // 树节点选中
  const onTreeSelect = (selection: T[]) => {
    if (selection.length > mixState.selectedNodes.length) {
      const selected = selection.filter(
        (item) => !mixState.selectedNodes.some((item2) => item2[mixState.idField] === item[mixState.idField])
      )
      traverseTree(
        selected,
        (item) => {
          table.value.toggleRowSelection(item, true)
          if (!mixState.selectedNodes.some((item2) => item2[mixState.idField] === item[mixState.idField])) {
            ;(mixState.selectedNodes as T[]).push(item)
          }
        },
        mixState.treeFields
      )
    } else {
      const selected = mixState.selectedNodes.filter(
        (item) => !selection.some((item2) => item2[mixState.idField] === item[mixState.idField])
      )
      traverseTree(
        selected,
        (item) => {
          table.value.toggleRowSelection(item, false)
          mixState.selectedNodes = mixState.selectedNodes.filter((item2) => item2[mixState.idField] !== item[mixState.idField])
        },
        mixState.treeFields
      )
    }
  }

  // 树节点全选
  const onTreeSelectAll = (selection: T[]) => {
    onTreeSelect(selection)
  }

  // 获取上级节点名称
  const getParentName = (parentId: string, nameField = 'name') => {
    const parent = getTreeNode(mixState.data as T[], (n) => n[mixState.idField] === parentId)
    return parent ? parent[nameField] : '无'
  }

  //===============================================================================
  // del
  //===============================================================================

  // 删除
  const del = async (row?: T, prompt?: string) => {
    if (!mixState.delApi) {
      return
    }
    for (const fn of mixHandlers.beforeDel) {
      if (!(await fn?.())) {
        return
      }
    }
    const rows = row ? [row] : mixState.selectedNodes
    const promptStr = prompt ? ' ' + prompt : '选择的项目'
    if (rows.length === 0) {
      ElMessage({
        message: '请选择要操作的数据项',
        type: 'error',
        duration: 2500
      })
      return
    }
    try {
      await ElMessageBox.confirm(`是否删除${promptStr} ?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const ids = stateOption.treeTable
        ? [...new Set(getTreeNodes(rows, () => true, mixState.treeFields))].map((item) => item[mixState.idField])
        : rows.map((item) => item[mixState.idField])
      mixState.delLoading = true
      await mixState.delApi(ids)
      ElMessage({
        message: '操作成功',
        type: 'success',
        duration: 1500
      })
      mixState.delLoading = false
      setPageAfterDel()
      for (const fn of mixHandlers.afterDel) {
        await fn?.()
      }
      await getList()
    } catch (e) {
      mixState.delLoading = false
      console.log(e)
    }
  }

  // 预防删除第二页最后一条数据时，或者多选删除第二页的数据时，页码错误导致请求无数据
  const setPageAfterDel = (size = 1) => {
    if (mixState.data.length === size && mixState.page !== 0) {
      mixState.current = mixState.current - 1
    }
  }

  //===============================================================================
  // export
  //===============================================================================

  // 通用导出
  const exportData = useThrottleFn(
    async (range: ExportRange = 'page') => {
      if (!mixState.exportApi) {
        return
      }
      for (const fn of mixHandlers.beforeGetList) {
        if (!(await fn?.())) {
          return
        }
      }
      mixState.exportLoading = true

      try {
        if (range === 'all') {
          await ElMessageBox.confirm(`是否导出全部页数据？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        }
        await mixState.exportApi(mixState.exportTitle, getQueryParam(), range)
        window.setTimeout(() => (mixState.exportLoading = false), 1500)
      } catch (e) {
        console.log(e)
        mixState.exportLoading = false
      }
    },
    1500,
    false,
    true
  )

  const exportDataAll = async () => {
    await exportData('all')
  }

  //===============================================================================
  // edit dialog
  //===============================================================================

  // 显示添加、修改对话框
  const showEdit = async (current: T | string) => {
    const id = isString(current) ? current : current?.[mixState.idField]
    mixState.editShow = true
    await nextTick(() => {
      editDialog.value.open(id)
    })
  }

  //===============================================================================
  // detail dialog
  //===============================================================================

  // 显示详细内容
  const showDetail = async (idx: number) => {
    mixState.detailShow = true
    await nextTick(() => {
      detailDialog.value.open(mixState.data, idx, { dicts: mixState.dicts })
    })
  }

  // 详细对话框导航时
  const onDetailNavigate = (id: string) => {
    const current = unref<T[]>(mixState.data).find((d) => d.id === id)
    table.value.setCurrentRow(current)
    setCurrentData(id)
  }

  // 详情对话框默认参数
  const detailAttrs = computed(() => {
    return {
      onNavigate: onDetailNavigate
    }
  })

  //===============================================================================
  // query form
  //===============================================================================

  // 显示、隐藏查询表单
  const toggleQueryForm = () => {
    mixState.queryFormShow = !mixState.queryFormShow
  }

  //===============================================================================
  // table
  //===============================================================================

  // 表格列内容空formatter
  const colEmptyFormatter = (row: any, column: any, cellValue: any) => {
    return cellValue ? cellValue : '无'
  }

  // 表格选择
  const onSelectionChange = (val: T[]) => {
    ;(mixState.selectedNodes as T[]) = val
  }

  // 表格行点击
  const onTableRowClick = (row: T) => {
    setCurrentData(row?.id)
  }

  // 设置当前行
  const setCurrentData = (id: string) => {
    if (mixState.tableRowSelectable) {
      if (!id) {
        mixState.currentId = ''
      } else {
        mixState.currentId = id
      }
      nextTick(() => {
        focusCurrentRow()
      })
    }
  }

  // use-table
  const {
    focusCurrentRow,
    columns,
    rowDensity,
    expandAll,
    stripe,
    border,
    tableAttrs: _tableAttrs
  } = useTable(table, {
    rowFocusable: mixState.tableRowSelectable,
    rowDraggable: mixState.rowDraggable,
    data: () => mixState.data,
    treeTable: mixState.treeTable,
    configurable: true,
    alias: mixState.alias,
    defaultExpandAll: mixState.defaultExpandAll
  })

  //===============================================================================
  // default attrs
  //===============================================================================

  // fd-page-main默认参数
  const pageMainAttrs = computed(() => {
    return {
      queryData: mixState.query,
      'onUpdate:queryData': (val: ApiQuery) => (mixState.query = val),
      queryVisible: mixState.queryFormShow,
      'onUpdate:queryVisible': (val: boolean) => (mixState.queryFormShow = val),
      queryFn: queryList,
      resetFn: resetQuery
    }
  })

  // fd-page-act默认参数
  const pageActAttrs = computed(() => {
    return {
      queryData: mixState.query,
      queryFn: queryList,
      queryVisible: mixState.queryFormShow,
      'onUpdate:queryVisible': (val: boolean) => (mixState.queryFormShow = val),
      onCreate: showEdit,
      onDel: del,
      onExport: exportData,
      onExportAll: exportDataAll,
      tableOption: {
        expandAll: () => expandAll,
        rowDensity: () => rowDensity,
        columns: () => columns,
        stripe: () => stripe,
        border: () => border
      }
    }
  })

  // el-table默认参数
  const tableAttrs = computed(() => {
    const result = {
      highlightCurrentRow: _tableAttrs.value.highlightCurrentRow,
      data: mixState.data,
      rowKey: mixState.idField,
      border: _tableAttrs.value.border,
      stripe: _tableAttrs.value.stripe,
      onSelectionChange: onSelectionChange,
      onRowClick: onTableRowClick
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
      currentPage: mixState.current,
      pageCount: mixState.count,
      pageSize: mixState.siz,
      pageSizes: [10, 15, 20, 50, 100, 200],
      total: mixState.total,
      layout: 'total, sizes, prev, pager, next, jumper',
      onCurrentChange: pageChange,
      onSizeChange: sizeChange
    }
  })

  return {
    mixRefs: {
      queryForm,
      table,
      editDialog,
      detailDialog
    },
    mixState,
    mixComputed: {
      columns,
      rowDensity,
      expandAll,
      stripe,
      border
    },
    mixMethods: {
      getList,
      queryList,
      resetQuery,
      del,
      dictVal,
      exportData,
      sortChanged,
      showEdit,
      showDetail,
      getParentName,
      toggleQueryForm,
      onBeforeGetList,
      onAfterGetList,
      onBeforeDel,
      onAfterDel,
      colEmptyFormatter
    },
    mixAttrs: {
      pageMainAttrs,
      tableAttrs,
      paginationAttrs,
      detailAttrs,
      pageActAttrs
    }
  }
}
