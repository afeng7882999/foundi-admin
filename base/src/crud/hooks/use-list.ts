import { nextTick, onMounted, reactive, ref, unref } from 'vue'
import { isString, merge } from 'lodash-es'
import useDict from './use-dict'
import { scrollDocToTop } from '@b/utils/smooth-scroll'
import { arrayToTree, getTreeNode, getTreeNodes, TreeFields, traverseTree } from '@b/utils/data-tree'
import { Ref } from '@vue/reactivity'
import { DetailDialog, NavigateResult } from './use-detail'
import { EditDialog } from './use-edit'
import { ApiObj, ApiQuery, ExportRange } from '@b/api'
import { DictList } from '@b/api/system/dict-item'
import { AnyFunction, Indexable } from '@b/common/types'
import { MaybeRef, useThrottleFn } from '@vueuse/core'
import { FdVirtualGridType, InternalItem } from '@b/components/virtual-grid/types'
import { message, messageBoxConfirm } from '@b/common/global'

export interface PageState {
  // 页码
  current: number
  // 每页数据条数
  siz: number
  // 数据总数
  total: number
  // 总页数
  count: number
}

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
  // 数据页对象
  pageState: PageState
  // 导出Excel文件名前缀
  exportTitle: string
  // 等待时间
  loadingWait: number
  // 删除数据的api
  delApi: AnyFunction
  // 导出数据的api
  exportApi: AnyFunction
  // 是否使用卡片模式
  gridViewEnable: boolean

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
  grid: Ref<FdVirtualGridType>
  editDialog: Ref<EditDialog>
  detailDialog: Ref<DetailDialog<T>>
}

export default function <T extends ApiObj>(stateOption: ListStateOption<T> | TreeStateOption<T>, refs?: Partial<Refs<T>>) {
  //===============================================================================
  // ref
  //===============================================================================

  const grid = refs?.grid ?? (ref() as Ref<FdVirtualGridType>)
  const editDialog = refs?.editDialog ?? (ref() as Ref<EditDialog>)
  const detailDialog = refs?.detailDialog ?? (ref() as Ref<DetailDialog<T>>)

  //===============================================================================
  // state
  //===============================================================================

  const defaultGridState = {
    // 是否使用卡片模式
    gridViewEnable: true,
    // 卡片模式
    gridView: false,
    // 卡片选择模式
    gridSelectMode: false,
    // 卡片模式，当前页第一项的索引值
    gridFirstIndexInPage: 0,
    // 卡片模式，初始化索引值
    gridInitIndex: 0,
    // 卡片模式，高亮对象索引
    gridFocusIndex: undefined as number | undefined,
    // 卡片模式，分页参数
    gridPageState: {
      // 页码
      current: 1,
      // 每页获取数据条数
      siz: 50,
      // 每页滚动数据条数
      scrollSiz: 20,
      // 数据总数
      total: 0,
      // 总页数
      count: 0
    }
  }

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
    // 高亮对象
    focusedItem: undefined as MaybeRef<T | undefined>,
    // 分页参数
    pageState: {
      // 页码
      current: 1,
      // 每页数据条数
      siz: 20,
      // 数据总数
      total: 0,
      // 总页数
      count: 0
    },
    // 导出Excel文件名前缀
    exportTitle: '导出',
    // 等待时间
    loadingWait: 300,
    // 导出的 Loading
    exportLoading: false,
    // 表格 Loading 属性
    loading: true,
    // 删除 Loading 属性
    delLoading: false,
    // 选择的项目
    selectedItems: [] as MaybeRef<T[]>,
    // 弹窗属性
    editShow: false,
    // detail dialog visible
    detailShow: false,
    // 是否显示查询表单
    queryFormShow: false,

    ...defaultGridState
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
    // 根节点名称
    rootName: '根节点'
  }

  const listState = stateOption.treeTable
    ? reactive(merge({}, defaultTreeState, stateOption) as typeof defaultTreeState & TreeStateOption<T>)
    : reactive(merge({}, defaultState, stateOption) as typeof defaultState & ListStateOption<T>)

  //===============================================================================
  // handler
  //===============================================================================

  const mixHandlers = {
    // 查询表单重置
    queryFormReset: [] as Array<() => void>,
    // 获取数据列表之前
    beforeGetList: [] as Array<() => Promise<boolean>>,
    // 获取数据列表之后
    afterGetList: [] as Array<(resData: Indexable) => Promise<void>>,
    // 删除之前
    beforeDel: [] as Array<(items: T[]) => Promise<boolean>>,
    // 删除之后
    afterDel: [] as Array<() => Promise<void>>,
    // 导出数据之前
    beforeExport: [] as Array<(range: ExportRange) => Promise<boolean>>
  }

  // 查询表单重置
  const onQueryFormReset = (fn: () => void) => {
    mixHandlers.queryFormReset.push(fn)
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
  const onBeforeDel = (fn: (items: T[]) => Promise<boolean>) => {
    mixHandlers.beforeDel.push(fn)
  }

  // 删除之后
  const onAfterDel = (fn: () => Promise<void>) => {
    mixHandlers.afterDel.push(fn)
  }

  // 导出数据之前
  const onBeforeExport = (fn: (range: ExportRange) => Promise<boolean>) => {
    mixHandlers.beforeExport.push(fn)
  }

  //===============================================================================
  // list
  //===============================================================================

  // 字典方法
  const { getDictData, dictVal } = useDict(listState.dicts)

  // 获取数据列表
  const getList = async () => {
    if (!listState.listApi) {
      return
    }
    for (const fn of mixHandlers.beforeGetList) {
      if (!(await fn?.())) {
        return
      }
    }
    try {
      listState.loading = true
      const query = getQueryParam()
      const { data, total, count, resData } = await listState.listApi(query)
      if (stateOption.treeTable) {
        setTreeData(data)
      } else {
        listState.pageState.total = total
        listState.pageState.count = count
        listState.data = data
      }
      listState.selectedItems = []
      for (const fn of mixHandlers.afterGetList) {
        await fn?.(resData)
      }
      setTimeout(() => {
        listState.loading = false
      }, listState.loadingWait)
    } catch (e) {
      listState.loading = false
      console.log(e)
    }
  }

  // 显示页面即获取数据
  onMounted(async () => {
    await getDictData()
    if (listState.gridView) {
      return
    }
    await getList()
  })

  //===============================================================================
  // query
  //===============================================================================

  // 构造查询参数和分页
  const getQueryParam = () => {
    if (stateOption.treeTable) {
      return {
        ...listState.query,
        ...listState.params
      }
    }

    const orderByList = [] as string[]
    if (listState.query.sort) {
      listState.query.sort.forEach((s) => {
        orderByList.push(`${s.prop}:${s.order}`)
      })
    }

    return {
      current: listState.pageState.current,
      size: listState.pageState.siz,
      ...listState.params,
      ...listState.query,
      orderByList
    }
  }

  // 查询方法
  const queryList = async () => {
    if (listState.gridView) {
      await gridQueryList()
      return
    }

    listState.pageState.current = 1
    await getList()
  }

  // 重置查询
  const resetQuery = async () => {
    for (const fn of mixHandlers.queryFormReset) {
      fn?.()
    }
    listState.query.sort = []
    await queryList()
  }

  // 表格排序
  const sortChanged = async ({ prop, order }: { prop: string; order: 'asc' | 'desc' | 'none' }) => {
    if (!prop || !order) {
      return
    }

    if (order === 'none') {
      listState.query.sort = listState.query.sort?.filter((f) => f.prop !== prop)
      await getList()
      return
    }

    const o = order as 'asc' | 'desc'
    if (listState.sortMulti) {
      const field = listState.query.sort?.find((s) => s.prop === prop)
      if (field) {
        field.order = o
      } else {
        listState.query.sort?.push({ prop, order: o })
      }
      await getList()
      return
    }

    listState.query.sort = [{ prop, order: o }]
    await getList()
  }

  // 显示、隐藏查询表单
  const toggleQueryForm = () => {
    listState.queryFormShow = !listState.queryFormShow
  }

  // 改变页码
  const pageChange = async (val: number) => {
    listState.pageState.current = val
    await getList()
    scrollDocToTop()
  }

  // 改变每页显示数
  const sizeChange = async (val: number) => {
    listState.pageState.current = 1
    listState.pageState.siz = val
    await getList()
    scrollDocToTop()
  }

  //===============================================================================
  // tree table
  //===============================================================================

  // 处理树状数据
  const setTreeData = (data: any[]) => {
    const treeData = arrayToTree(data, listState.treeFields)
    listState.data = traverseTree(
      treeData,
      (item) => {
        const node = getTreeNode(
          treeData,
          (n) => n[listState.treeFields.idField as string] === item[listState.treeFields.parentIdField as string],
          listState.treeFields
        )
        item.parentName = node ? node.name : listState.rootName
      },
      listState.treeFields
    )
  }

  // 获取上级节点名称
  const getParentName = (parentId: string, nameField = 'name') => {
    const parent = getTreeNode(unref<T[]>(listState.data), (n) => n[listState.idField] === parentId)
    return parent ? parent[nameField] : '无'
  }

  //===============================================================================
  // del
  //===============================================================================

  // 删除
  const del = async (row?: T, prompt?: string) => {
    if (!listState.delApi) {
      return
    }
    const rows = row ? [row] : listState.selectedItems
    const promptStr = prompt ? ' ' + prompt : '选择的项目'
    for (const fn of mixHandlers.beforeDel) {
      if (!(await fn?.(rows))) {
        return
      }
    }
    if (rows.length === 0) {
      message('请选择要操作的数据项', 'error', 2500)
      return
    }
    try {
      await messageBoxConfirm(`是否删除${promptStr} ?`, '提示', '确定', '取消', 'warning')
      const ids = stateOption.treeTable
        ? [...new Set(getTreeNodes(rows, () => true, listState.treeFields))].map((item) => item[listState.idField])
        : rows.map((item) => item[listState.idField])
      listState.delLoading = true
      await listState.delApi(ids)

      if (listState.gridView) {
        await gridDel()
        return
      }

      message('操作成功', 'success', 1500)
      listState.delLoading = false
      setPageAfterDel()
      for (const fn of mixHandlers.afterDel) {
        await fn?.()
      }
      await getList()
    } catch (e) {
      listState.delLoading = false
      console.log(e)
    }
  }

  // 预防删除第二页最后一条数据时，或者多选删除第二页的数据时，页码错误导致请求无数据
  const setPageAfterDel = (size = 1) => {
    if (listState.data.length === size && listState.page !== 0) {
      listState.pageState.current = listState.pageState.current - 1
    }
  }

  //===============================================================================
  // grid layout
  //===============================================================================

  // grid缓存
  let gridBuffer = [] as InternalItem[]
  // grid高亮对象索引
  let gridFocusedItem = {} as T

  const pageProvider = async (pageNumber: number, pageSize: number) => {
    if (!listState.listApi) {
      return
    }
    for (const fn of mixHandlers.beforeGetList) {
      if (!(await fn?.())) {
        return
      }
    }

    try {
      const query = getGridQueryParam(pageSize)
      query.current = pageNumber
      const { data, total, resData } = await listState.listApi(query)
      listState.gridPageState.total = total
      listState.gridPageState.count = Math.ceil(total / listState.gridPageState.scrollSiz)

      for (const fn of mixHandlers.afterGetList) {
        await fn?.(resData)
      }

      return data
    } catch (e) {
      console.log(e)
    }
  }

  const gridQueryList = async () => {
    listState.gridPageState.current = 1
    listState.selectedItems = []
    await grid.value.refresh()
  }

  const getGridQueryParam = (pageSize: number) => {
    if (stateOption.treeTable) {
      return {
        ...listState.query,
        ...listState.params
      }
    }

    const orderByList = [] as string[]
    if (listState.query.sort) {
      listState.query.sort.forEach((s) => {
        orderByList.push(`${s.prop}:${s.order}`)
      })
    }

    return {
      current: listState.gridPageState.current,
      size: pageSize,
      ...listState.params,
      ...listState.query,
      orderByList
    }
  }

  const gridPageChange = (val: number) => {
    listState.gridPageState.current = val
    grid.value.scrollToPage(val, true)
  }

  const gridPageSizeChange = async (val: number) => {
    listState.gridPageState.scrollSiz = val
    listState.gridPageState.count = Math.ceil(listState.gridPageState.total / val)
    listState.gridPageState.current = 1
    await grid.value.refresh()
  }

  const gridOffsetChanged = ({ index, page }: { index: number; localIndex: number; page: number }) => {
    listState.gridPageState.current = page
    listState.gridFirstIndexInPage = index
  }

  const gridBufferRefreshed = ({ buffer }: { index: number; localIndex: number; buffer: InternalItem[] }) => {
    gridBuffer = buffer
  }

  const gridSelected = ({ item, selected }: { item: T; selected: boolean }) => {
    const itemIdx = listState.selectedItems.findIndex((i) => i[listState.idField] === item[listState.idField])
    if (selected && itemIdx === -1) {
      unref<T[]>(listState.selectedItems).push(item)
      return
    }
    if (!selected && itemIdx !== -1) {
      listState.selectedItems.splice(itemIdx, 1)
      return
    }
  }

  // 切换选择模式
  const toggleSelectMode = () => {
    listState.selectedItems = []
    listState.gridFocusIndex = undefined
    gridFocusedItem = {} as T
    listState.gridSelectMode = !listState.gridSelectMode
  }

  // 显示详细内容
  const gridShowDetail = async ({ index, item }: { index: number; item: T }) => {
    listState.gridFocusIndex = index
    listState.detailShow = true
    await nextTick(() => {
      detailDialog.value.open(item, listState.gridPageState.total, index, onNavigateOfGrid, { dicts: listState.dicts })
    })
  }

  // 删除
  const gridDel = async () => {
    await grid.value.refreshBuffer()
  }

  // 详细对话框导航时
  const onNavigateOfGrid = (direction: 'prev' | 'next'): NavigateResult<T> => {
    let idx = listState.gridFocusIndex as number
    let prevEnabled = true
    let nextEnabled = true
    if (direction === 'prev') {
      idx--
      if (idx <= 0) {
        prevEnabled = false
      }
    } else {
      idx++
      if (idx >= listState.gridPageState.total - 1) {
        nextEnabled = false
      }
    }
    const data = gridBuffer.find((b: InternalItem) => b.index === idx)?.value as T

    if (data) {
      // buffer is filled
      listState.gridFocusIndex = idx
      gridFocusedItem = data
      grid.value.scrollToIdx(idx)
      return {
        prevEnabled,
        nextEnabled,
        idx: listState.gridFocusIndex,
        data
      }
    }

    // buffer is not filled, skip navigation
    return {
      prevEnabled: undefined,
      nextEnabled: undefined,
      idx: listState.gridFocusIndex as number,
      data: gridFocusedItem
    }
  }

  //===============================================================================
  // export
  //===============================================================================

  // 通用导出
  const exportData = useThrottleFn(
    async (range: ExportRange = 'page') => {
      if (!listState.exportApi) {
        return
      }
      for (const fn of mixHandlers.beforeExport) {
        if (!(await fn?.(range))) {
          return
        }
      }
      listState.exportLoading = true

      try {
        if (range === 'all') {
          await messageBoxConfirm(`是否导出全部页数据？`, '提示', '确定', '取消', 'warning')
        }
        await listState.exportApi(listState.exportTitle, getQueryParam(), range)
        window.setTimeout(() => (listState.exportLoading = false), 1500)
      } catch (e) {
        console.log(e)
        listState.exportLoading = false
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
  // dialogs
  //===============================================================================

  // 显示添加、修改对话框
  const showEdit = async (current?: T | string) => {
    const id = isString(current) ? current : current?.[listState.idField]
    listState.editShow = true
    await nextTick(() => {
      editDialog.value.open(id)
    })
  }

  // 显示详细内容
  const showDetail = async (item: T) => {
    listState.focusedItem = item
    listState.detailShow = true
    const idx = unref<T[]>(listState.data).findIndex((d) => d[listState.idField] === item[listState.idField])
    await nextTick(() => {
      detailDialog.value.open(item, listState.data.length, idx, onNavigate, { dicts: listState.dicts })
    })
  }

  // 详细对话框导航时
  const onNavigate = (direction: 'prev' | 'next'): NavigateResult<T> => {
    let idx = unref<T[]>(listState.data).findIndex((d) => d[listState.idField] === (listState.focusedItem as T)[listState.idField])
    let prevEnabled = true
    let nextEnabled = true
    if (direction === 'prev') {
      idx--
      if (idx <= 0) {
        prevEnabled = false
      }
    } else {
      idx++
      if (idx >= listState.data.length - 1) {
        nextEnabled = false
      }
    }
    const focused = listState.data[idx]
    if (!focused) {
      listState.focusedItem = undefined
    } else {
      listState.focusedItem = focused
    }
    return {
      prevEnabled,
      nextEnabled,
      idx,
      data: focused
    }
  }

  return {
    listRefs: {
      grid,
      editDialog,
      detailDialog
    },
    listState,
    listMethods: {
      // list
      getList,
      queryList,
      resetQuery,
      toggleQueryForm,
      sortChanged,
      pageChange,
      sizeChange,
      del,
      exportData,
      exportDataAll,
      showEdit,
      showDetail,
      dictVal,
      getParentName,
      // grid
      pageProvider,
      gridPageChange,
      gridPageSizeChange,
      gridOffsetChanged,
      gridBufferRefreshed,
      gridSelected,
      gridShowDetail,
      toggleSelectMode,
      onNavigateOfGrid,
      // hook methods
      onQueryFormReset,
      onBeforeGetList,
      onAfterGetList,
      onBeforeDel,
      onAfterDel,
      onBeforeExport
    }
  }
}
