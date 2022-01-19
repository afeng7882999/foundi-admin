import { AnyFunction, AnyObject, needImplFunc } from '@/utils'
import { nextTick, onMounted, reactive, ref } from 'vue'
import { merge } from 'lodash-es'
import { ElMessage, ElMessageBox } from 'element-plus'
import usePage from './use-page'
import useDict, { IDictList } from './use-dict'
import { scrollToTop } from '@/utils/smooth-scroll'
import { nextFrame } from '@/utils/next-frame'
import {formatTimestamp2} from "@/utils/time";

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

  // 每页数据条数
  size?: number

  // 导出Excel文件名前缀
  exportTitle?: string

  // 等待时间
  waitAfterGet?: number

  [key: string]: any
}

export default function <T extends IListStateOption>(stateOption: T) {
  const queryForm = ref()
  const table = ref()
  const editDialog = ref()
  const detailDialog = ref()

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
    // 排序规则，支持多字段排序 { id: 'desc', createTime: 'asc' }
    sort: {} as AnyObject,
    // 页码
    current: 0,
    // 每页数据条数
    size: 20,
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

  const mixState = reactive(merge({}, defaultState, stateOption) as typeof defaultState & T)

  const mixHandlers = {
    // 获取数据列表之前
    beforeGetList: async () => {
      return true
    },
    // 获取数据列表之后
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
    await nextFrame(async () => {
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
      const { data, total, count, resData } = await mixState.listApi(getQueryParam())
      mixState.total = total
      mixState.count = count
      mixState.data = data
      mixState.selectedNodes = []
      await mixHandlers.afterGetList(resData)
      setTimeout(() => {
        mixState.loading = false
      }, mixState.waitAfterGet)
    } catch (e) {
      mixState.loading = false
      console.log(e)
    }
  }

  // 构造查询参数和分页
  const getQueryParam = () => {
    const orderByList = [] as string[]
    Object.keys(mixState.sort).forEach((key) => {
      if (mixState.sort[key]) {
        orderByList.push(`${key}:${mixState.sort[key]}`)
      }
    })
    return {
      current: mixState.current,
      size: mixState.size,
      ...mixState.params,
      ...mixState.query,
      orderByList
    }
  }

  // 改变页码
  const pageChange = async (val: number) => {
    mixState.current = val
    await getList()
    scrollToTop()
  }

  // 改变每页显示数
  const sizeChange = async (val: number) => {
    mixState.current = 0
    mixState.size = val
    await getList()
    scrollToTop()
  }

  // 查询方法
  const queryList = async () => {
    mixState.current = 0
    await getList()
  }

  // 重置查询
  const resetQuery = async () => {
    ;(queryForm.value as any).resetFields()
    mixState.sort = {}
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
      const ids = rows.map((item: AnyObject) => item[mixState.idField])
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
      if (!editDialog.value) {
        return
      }
      ;(editDialog.value as any).open(id)
    })
  }

  // 显示详细内容
  const showDetail = async (idx: number) => {
    mixState.detailShow = true
    await nextTick(() => {
      if (!detailDialog.value) {
        return
      }
      ;(detailDialog.value as any).open(mixState.data, idx, mixState.dicts)
    })
  }

  // 表格选择
  const onSelectionChange = (val: AnyObject[]) => {
    mixState.selectedNodes = val
  }

  // 显示、隐藏查询表单
  const toggleQueryForm = () => {
    mixState.queryFormShow = !mixState.queryFormShow
  }

  // 表格列内容空formatter
  const colEmptyFormatter = (row: any, column: any, cellValue: any) => {
    return cellValue ? cellValue : '无'
  }

  // 可排序表格排序
  const sortChanged = async ({ prop, order }: { prop: string; order: string }) => {
    if (prop) {
      mixState.sort[prop] = order
      await getList()
    }
  }

  const { pageMinHeight, pageHeight, showPageHeader, hasAuth, setViewTitle, currentViewTitle } = usePage()

  return {
    mixRefs: {
      queryForm,
      table,
      editDialog,
      detailDialog
    },
    mixState,
    mixComputed: {
      pageMinHeight,
      pageHeight,
      showPageHeader
    },
    mixMethods: {
      getList,
      pageChange,
      sizeChange,
      queryList,
      resetQuery,
      del,
      dictVal,
      dateTimeStr,
      hasAuth,
      exportData,
      showEdit,
      showDetail,
      onSelectionChange,
      toggleQueryForm,
      onBeforeGetList,
      onAfterGetList,
      onBeforeDel,
      onAfterDel,
      setViewTitle,
      currentViewTitle,
      colEmptyFormatter,
      sortChanged
    }
  }
}
