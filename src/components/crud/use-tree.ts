import { arrayToTree, getTreeNode, getTreeNodes, ITreeFields, traverseTree } from '@/utils/data-tree'
import { AnyFunction, AnyObject, needImplFunc } from '@/utils'
import { nextTick, onMounted, reactive, ref } from 'vue'
import { merge } from 'lodash-es'
import { ElMessage, ElMessageBox } from 'element-plus'
import usePage from '@/components/crud/use-page'
import { nextFrame } from '@/utils/next-frame'
import useDict, { IDictList } from '@/components/crud/use-dict'
import { formatTimestamp2 } from '@/utils/time'

interface ITreeStateOption {
  // 主键
  idField?: string
  // 树表字段
  treeFields?: ITreeFields

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
  // 查询数据的参数
  params?: AnyObject
  // 待查询的对象
  query?: AnyObject

  // 导出Excel文件名前缀
  exportTitle?: string

  // 等待时间
  waitAfterGet?: number
  // 是否显示查询表单
  queryFormShow?: boolean

  // 默认展开所有树
  defaultExpandAll?: boolean
  // 根节点名称
  rootName?: string

  [key: string]: any
}

export default function <T extends ITreeStateOption>(stateOption: T) {
  const pageRoot = ref<HTMLElement | null>(null)
  const queryForm = ref()
  const table = ref()
  const editDialog = ref()
  const detailDialog = ref()

  const defaultState = {
    // 主键
    idField: 'id',
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
    // 查询数据的参数
    params: {} as AnyObject,
    // 待查询的对象
    query: {} as AnyObject,
    // 导出Excel文件名前缀
    exportTitle: '导出',
    // 等待时间
    waitAfterGet: 50,
    // 是否显示查询表单
    queryFormShow: false,
    // 导出的 Loading
    exportLoading: false,
    // 表格 Loading 属性
    loading: true,
    // 删除 Loading 属性
    delLoading: false,
    // 默认展开所有树
    defaultExpandAll: true,
    // 选择的树节点
    selectedNodes: [] as AnyObject[],
    // 根节点名称
    rootName: '根节点',
    // 弹窗
    editShow: false,
    // detail dialog visible
    detailShow: false
  }

  const mixState = reactive(merge(defaultState, stateOption as AnyObject) as typeof defaultState & T)

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

  // 字典方法
  const { getDictData, dictVal } = useDict(mixState.dicts)

  // 时间戳格式化
  const dateTimeStr = (timestamp: string, shape = 'datetime' as 'time' | 'date' | 'datetime') => {
    return formatTimestamp2(Number(timestamp), shape)
  }

  // 显示页面即获取数据
  onMounted(async () => {
    mixState.loading = true
    nextFrame(async () => {
      await getList()
    })
  })

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
      const { data, resData } = await mixState.listApi(getQueryParam())
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
      mixState.selectedNodes = []
      await mixHandlers.afterGetList(resData)
      setTimeout(() => {
        mixState.loading = false
      }, mixState.waitAfterGet)
    } catch (e) {
      console.log(e)
      mixState.loading = false
    }
  }

  // 构造查询参数
  const getQueryParam = () => {
    return {
      ...mixState.query,
      ...mixState.params
    }
  }

  // 查询方法
  const queryList = async () => {
    await getList()
  }

  // 重置查询
  const resetQuery = async () => {
    ;(queryForm.value as any).resetFields()
    console.log('query', mixState.query)
    await queryList()
  }

  // 删除
  const del = async (row?: AnyObject, prompt?: string) => {
    if (mixState.delApi === needImplFunc) {
      return
    }
    if (!(await mixHandlers.beforeDel())) {
      return
    }
    const rows = row ? [row] : mixState.selectedNodes
    const promptStr = prompt ? prompt : '选择的节点'
    if (rows.length === 0) return
    try {
      await ElMessageBox.confirm(`是否删除 ${promptStr} ?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const ids = [...new Set(getTreeNodes(rows, () => true, mixState.treeFields))].map(
        (item) => item[mixState.idField]
      )
      mixState.delLoading = true
      await mixState.delApi(ids)
      ElMessage({
        message: '操作成功',
        type: 'success',
        duration: 1500
      })
      mixState.delLoading = false
      await mixHandlers.afterDel()
      await getList()
    } catch (e) {
      console.log(e)
      mixState.delLoading = false
    }
  }

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

  // 显示添加、修改对话框
  const showEdit = async (id?: string) => {
    mixState.editShow = true
    await nextTick(() => {
      ;(editDialog.value as any).open(id)
    })
  }

  // show detail dialog
  const showDetail = async (idx: number) => {
    mixState.detailShow = true
    await nextTick(() => {
      if (!detailDialog.value) {
        return
      }
      ;(detailDialog.value as any).open(mixState.data, idx, { dicts: mixState.dicts })
    })
  }

  // 树节点选中
  const onSelect = (selection: AnyObject[]) => {
    const tbl = table.value as any
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
          mixState.selectedNodes = mixState.selectedNodes.filter(
            (item2) => item2[mixState.idField] !== item[mixState.idField]
          )
        },
        mixState.treeFields
      )
    }
  }

  // 树节点全选
  const onSelectAll = (selection: AnyObject[]) => {
    onSelect(selection)
  }

  const {
    docMinHeight,
    docHeight,
    showPageHeader,
    getBodyWidth,
    getBodyHeight,
    getDocWidth,
    getDocHeight,
    hasAuth,
    setViewTitle,
    currentViewTitle
  } = usePage()

  // 显示、隐藏查询表单
  const toggleQueryForm = () => {
    mixState.queryFormShow = !mixState.queryFormShow
  }

  return {
    mixRefs: {
      pageRoot,
      queryForm,
      table,
      editDialog,
      detailDialog
    },
    mixState,
    mixComputed: {
      docMinHeight,
      docHeight,
      showPageHeader
    },
    mixMethods: {
      getList,
      queryList,
      resetQuery,
      del,
      dictVal,
      dateTimeStr,
      hasAuth,
      exportData,
      showEdit,
      showDetail,
      toggleQueryForm,
      onSelect,
      onSelectAll,
      onBeforeGetList,
      onAfterGetList,
      onBeforeDel,
      onAfterDel,
      setViewTitle,
      currentViewTitle,
      getBodyWidth,
      getBodyHeight,
      getDocWidth,
      getDocHeight
    }
  }
}
