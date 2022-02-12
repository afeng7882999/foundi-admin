import { AnyFunction, AnyObject, needImplFunc } from '@/utils'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { merge } from 'lodash-es'
import { ElForm, ElMessage, ElMessageBox } from 'element-plus'
import useDict, { IDictList } from './use-dict'
import { scrollDocToTop } from '@/utils/smooth-scroll'
import { nextFrame } from '@/utils/next-frame'
import useTable from '@/components/table/use-table'
import { arrayToTree, getTreeNode, getTreeNodes, ITreeFields, traverseTree } from '@/utils/data-tree'
import { Ref } from '@vue/reactivity'
import { ElTable } from 'element-plus/es'
import { IDetailDialog } from '@/components/crud/use-detail'
import { IEditDialog } from '@/components/crud/use-edit'

export interface IListStateOption {
  // 主键
  idField?: string
  // 请求单独数据的api
  getApi?: AnyFunction
  // 请求数据列表的api
  listApi: AnyFunction
  // 删除数据的api
  delApi?: AnyFunction
  // 导出数据的api
  exportApi?: AnyFunction
  // 字典
  dicts?: IDictList
  // 获取数据的固定参数
  params?: AnyObject
  // 查询数据的对象
  query?: AnyObject
  // 查询数据的条件个数
  queryLen?: number
  // 每页数据条数
  siz?: number
  // 导出Excel文件名前缀
  exportTitle?: string
  // 等待时间
  waitAfterGet?: number

  [key: string]: any
}

interface ITreeStateOption extends IListStateOption {
  // 是否是树表
  treeTable?: boolean
  // 树表字段
  treeFields?: ITreeFields
  // 默认展开所有树
  defaultExpandAll?: boolean
  // 根节点名称
  rootName?: string
}

interface IRefs {
  queryForm: Ref<InstanceType<typeof ElForm> | undefined>
  tableWrapper: Ref<HTMLElement | undefined>
  table: Ref<InstanceType<typeof ElTable> | undefined>
  editDialog: Ref<IDetailDialog | undefined>
  detailDialog: Ref<IEditDialog | undefined>
}

export default function <T extends IListStateOption | ITreeStateOption>(stateOption: T, refs?: IRefs) {
  //===============================================================================
  // ref
  //===============================================================================

  if (!refs) {
    const queryForm = ref()
    const tableWrapper = ref()
    const table = ref()
    const editDialog = ref()
    const detailDialog = ref()

    refs = {
      queryForm: queryForm,
      tableWrapper: tableWrapper,
      table: table,
      editDialog: editDialog,
      detailDialog: detailDialog
    }
  }

  //===============================================================================
  // state
  //===============================================================================

  const defaultState = {
    // 主键
    idField: 'id',
    // 请求单独数据的api
    getApi: needImplFunc,
    // 请求数据列表的api
    listApi: needImplFunc,
    // 删除数据的api
    delApi: needImplFunc,
    // 导出数据的api
    exportApi: needImplFunc,
    // 表格数据
    data: [] as AnyObject[],
    // 字典
    dicts: {} as IDictList,
    // 获取数据的固定参数
    params: {} as AnyObject,
    // 查询数据的对象
    query: {} as AnyObject,
    // 查询数据的条件个数
    queryLen: 0,
    // 排序规则，支持多字段排序 { id: 'desc', createTime: 'asc' }
    sort: {} as AnyObject,
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
    selectedNodes: [] as AnyObject[],
    // 弹窗属性
    editShow: false,
    // detail dialog visible
    detailShow: false,
    // 是否显示查询表单
    queryFormShow: false
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
    } as ITreeFields,
    // 默认展开所有树
    defaultExpandAll: true,
    // 选择的树节点
    selectedNodes: [] as AnyObject[],
    // 根节点名称
    rootName: '根节点'
  }

  const mixState = stateOption.treeTable
    ? reactive(merge({}, defaultTreeState, stateOption) as typeof defaultTreeState & T)
    : reactive(merge({}, defaultState, stateOption) as typeof defaultState & T)

  //===============================================================================
  // handler
  //===============================================================================

  const mixHandlers = {
    // 获取数据列表之前
    beforeGetList: async () => {
      return true
    },
    // 获取数据列表之后
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    afterGetList: async (resData: AnyObject) => {
      return
    },
    // 删除之前
    beforeDel: async () => {
      return true
    },
    // 删除之后
    afterDel: async () => {
      return
    }
  }

  // 获取数据列表之前
  const onBeforeGetList = (fn: () => Promise<boolean>) => {
    mixHandlers.beforeGetList = fn
  }

  // 获取数据列表之后
  const onAfterGetList = (fn: (resData: AnyObject) => Promise<void>) => {
    mixHandlers.afterGetList = fn
  }

  // 删除之前
  const onBeforeDel = (fn: () => Promise<boolean>) => {
    mixHandlers.beforeDel = fn
  }

  // 删除之后
  const onAfterDel = (fn: () => Promise<void>) => {
    mixHandlers.afterDel = fn
  }

  //===============================================================================
  // list
  //===============================================================================

  // 字典方法
  const { getDictData, dictVal } = useDict(mixState.dicts)

  // 获取数据列表
  const getList = async () => {
    if (mixState.listApi === needImplFunc) {
      return
    }
    if (!(await mixHandlers.beforeGetList())) {
      return
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
      await mixHandlers.afterGetList(resData)
      if (mixState.currentId) {
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
    Object.keys(mixState.sort).forEach((key) => {
      if (mixState.sort[key]) {
        orderByList.push(`${key}:${mixState.sort[key]}`)
      }
    })

    let len = 0
    for (const key in mixState.query) {
      const val = mixState.query[key]
      if (!val) {
        continue
      }
      if (Array.isArray(val) && val.length === 0) {
        continue
      }
      len++
    }
    mixState.queryLen = len

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
    if (refs) {
      ;(refs.queryForm.value as any).resetFields()
      mixState.sort = {}
      await queryList()
    }
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

  // el-pagination默认参数
  const pageAttrs = computed(() => {
    return {
      background: 'background',
      currentPage: mixState.current,
      pageCount: mixState.total,
      pageSize: mixState.siz,
      pageSizes: [10, 15, 20, 50, 100, 200],
      total: mixState.count,
      layout: 'total, sizes, prev, pager, next, jumper',
      onCurrentChange: pageChange,
      onSizeChange: sizeChange
    }
  })

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
  const onTreeSelect = (selection: AnyObject[]) => {
    if (!refs) {
      return
    }
    const tbl = refs.table.value as any
    if (selection.length > mixState.selectedNodes.length) {
      const selected = selection.filter(
        (item) => !mixState.selectedNodes.some((item2) => item2[mixState.idField] === item[mixState.idField])
      )
      traverseTree(
        selected,
        (item) => {
          tbl.toggleRowSelection(item, true)
          if (!mixState.selectedNodes.some((item2) => item2[mixState.idField] === item[mixState.idField])) {
            mixState.selectedNodes.push(item)
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
          tbl.toggleRowSelection(item, false)
          mixState.selectedNodes = mixState.selectedNodes.filter((item2) => item2[mixState.idField] !== item[mixState.idField])
        },
        mixState.treeFields
      )
    }
  }

  // 树节点全选
  const onTreeSelectAll = (selection: AnyObject[]) => {
    onTreeSelect(selection)
  }

  // 获取上级节点名称
  const getParentName = (parentId: string, nameField = 'name') => {
    const parent = getTreeNode(mixState.data, (n) => n[mixState.idField] === parentId)
    return parent ? parent[nameField] : '无'
  }

  //===============================================================================
  // del
  //===============================================================================

  // 删除
  const del = async (row?: AnyObject, prompt?: string) => {
    if (mixState.delApi === needImplFunc) {
      return
    }
    if (!(await mixHandlers.beforeDel())) {
      return
    }
    const rows = row ? [row] : mixState.selectedNodes
    const promptStr = prompt ? prompt : '选择的项目'
    if (rows.length === 0) {
      ElMessage({
        message: '请选择要操作的数据项',
        type: 'error',
        duration: 2500
      })
      return
    }
    try {
      await ElMessageBox.confirm(`是否删除 ${promptStr} ?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const ids = stateOption.treeTable
        ? [...new Set(getTreeNodes(rows, () => true, mixState.treeFields))].map((item) => item[mixState.idField])
        : rows.map((item: AnyObject) => item[mixState.idField])
      mixState.delLoading = true
      await mixState.delApi(ids)
      ElMessage({
        message: '操作成功',
        type: 'success',
        duration: 1500
      })
      mixState.delLoading = false
      setPageAfterDel()
      await mixHandlers.afterDel()
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
  const exportData = async () => {
    if (mixState.exportApi === needImplFunc) {
      return
    }
    if (!(await mixHandlers.beforeGetList())) {
      return
    }
    mixState.exportLoading = true
    try {
      await mixState.exportApi(mixState.exportTitle, mixState.params)
      mixState.exportLoading = false
    } catch (e) {
      console.log(e)
      mixState.exportLoading = false
    }
  }

  //===============================================================================
  // edit dialog
  //===============================================================================

  // 显示添加、修改对话框
  const showEdit = async (id?: string) => {
    mixState.editShow = true
    await nextTick(() => {
      if (!refs?.editDialog.value) {
        return
      }
      ;(refs.editDialog.value as any).open(id)
    })
  }

  //===============================================================================
  // detail dialog
  //===============================================================================

  // 显示详细内容
  const showDetail = async (idx: number) => {
    mixState.detailShow = true
    await nextTick(() => {
      if (!refs?.detailDialog.value) {
        return
      }
      ;(refs.detailDialog.value as any).open(mixState.data, idx, { dicts: mixState.dicts })
    })
  }

  // 详细对话框导航时
  const onDetailNavigate = (id: string) => {
    const current = mixState.data.find((d) => d.id === id)
    if (refs) {
      ;(refs.table.value as any).setCurrentRow(current)
    }
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
  const onSelectionChange = (val: AnyObject[]) => {
    mixState.selectedNodes = val
  }

  // 表格排序
  const sortChanged = async ({ prop, order }: { prop: string; order: string }) => {
    if (prop) {
      mixState.sort[prop] = order
      await getList()
    }
  }

  // 表格行点击
  const onTableRowClick = (row: AnyObject) => {
    setCurrentData(row?.id)
  }

  // 表格行高亮
  const { columns, rowDensity, expandAll, highlightCurrentRow } = useTable(refs.table, refs.tableWrapper, {
    rowSelectable: mixState.tableRowSelectable
  })

  // 设置当前行
  const setCurrentData = (id: string) => {
    if (mixState.tableRowSelectable) {
      if (!id) {
        mixState.currentId = ''
      } else {
        mixState.currentId = id
      }
      nextTick(() => {
        highlightCurrentRow()
      })
    }
  }

  // el-table默认参数
  const tableAttrs = computed(() => {
    if (stateOption.treeTable) {
      return {
        highlightCurrentRow: mixState.tableRowSelectable,
        data: mixState.data,
        rowKey: mixState.idField,
        defaultExpandAll: false,
        indent: 15,
        onSelectionChange: onSelectionChange,
        onRowClick: onTableRowClick,
        onSelect: onTreeSelect,
        onSelectAll: onTreeSelectAll
      }
    } else {
      return {
        highlightCurrentRow: mixState.tableRowSelectable,
        data: mixState.data,
        rowKey: mixState.idField,
        onSelectionChange: onSelectionChange,
        onRowClick: onTableRowClick
      }
    }
  })

  return {
    mixRefs: refs,
    mixState,
    mixComputed: {
      columns,
      rowDensity,
      expandAll
    },
    mixMethods: {
      getList,
      pageChange,
      sizeChange,
      queryList,
      resetQuery,
      del,
      dictVal,
      exportData,
      showEdit,
      showDetail,
      onSelectionChange,
      onTreeSelect,
      onTreeSelectAll,
      onTableRowClick,
      getParentName,
      toggleQueryForm,
      onBeforeGetList,
      onAfterGetList,
      onBeforeDel,
      onAfterDel,
      colEmptyFormatter,
      sortChanged,
      highlightCurrentRow
    },
    mixAttrs: {
      tableAttrs,
      pageAttrs,
      detailAttrs
    }
  }
}
