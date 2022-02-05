import { AnyFunction, AnyObject, needImplFunc } from '@/utils'
import { cloneDeep, merge } from 'lodash-es'
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import useDict, { IDictList } from '@/components/crud/use-dict'
import { arrayToTree, ITreeFields } from '@/utils/data-tree'

export interface IListEditStateOption {
  // 主键
  idField?: string
  // 请求单独数据的api
  getApi?: AnyFunction
  // 添加数据的api
  postApi?: AnyFunction
  //修改数据的api
  putApi?: AnyFunction
  // 是否为新增类型的表单
  isCreate?: boolean
  // 字典
  dicts?: IDictList
  // 重置表单
  resetFormData: AnyObject
  // 标题
  title?: string

  [key: string]: any
}

export interface ITreeEditStateOption extends IListEditStateOption {
  // 是否是树表
  treeTable?: boolean
  // 树表字段
  treeFields?: ITreeFields
  // 请求数据列表的api
  listApi?: AnyFunction
}

export const REFRESH_DATA_EVENT = 'refresh-data-list'

export default function <T extends IListEditStateOption | ITreeEditStateOption>(stateOption: T, emit: AnyFunction) {
  //===============================================================================
  // ref
  //===============================================================================

  const form = ref()

  //===============================================================================
  // state
  //===============================================================================

  const defaultState = {
    // 主键
    idField: 'id',
    // 请求单独数据的api
    getApi: needImplFunc,
    // 添加数据的api
    postApi: needImplFunc,
    //修改数据的api
    putApi: needImplFunc,
    // 是否为新增类型的表单
    isCreate: false,
    // 表单
    formData: {} as AnyObject,
    // 字典
    dicts: {} as IDictList,
    // 重置表单
    resetFormData: {} as AnyObject,
    // 标题
    title: '',
    // 选择的项目
    selectedNodes: [] as AnyObject[],
    // 是否显示
    visible: false
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
    // 请求数据列表的api
    listApi: needImplFunc,
    // 上级节点
    parentList: [] as AnyObject[]
  }

  const mixState = stateOption.treeTable
    ? reactive(merge({}, defaultTreeState, stateOption) as typeof defaultTreeState & T)
    : reactive(merge({}, defaultState, stateOption) as typeof defaultState & T)

  //===============================================================================
  // handler
  //===============================================================================

  const mixHandlers = {
    // 处理获取的数据
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    afterGetData: async (data: AnyObject) => {
      return
    },
    // 页面显示之前
    beforeOpen: async () => {
      return
    },
    // 处理提交的数据
    beforeSubmitData: async () => {
      return
    },
    // 提交之前
    beforeSubmit: async () => {
      return true
    },
    // 关闭之前
    afterClose: async () => {
      return
    }
  }

  // 处理获取的数据
  const onAfterGetData = (fn: (data: AnyObject) => Promise<void>) => {
    mixHandlers.afterGetData = fn
  }

  // 页面显示之前
  const onBeforeOpen = (fn: () => Promise<void>) => {
    mixHandlers.beforeOpen = fn
  }

  // 处理提交的数据
  const onBeforeSubmitData = (fn: () => Promise<void>) => {
    mixHandlers.beforeSubmitData = fn
  }

  // 提交之前
  const onBeforeSubmit = (fn: () => Promise<boolean>) => {
    mixHandlers.beforeSubmit = fn
  }

  // 关闭之前
  const onAfterClose = (fn: () => Promise<void>) => {
    mixHandlers.afterClose = fn
  }

  //===============================================================================
  // open
  //===============================================================================

  const { getDictData } = useDict(mixState.dicts)

  // 添加、编辑对话框
  const open = async (id: string) => {
    mixState.isCreate = !id || id === '-1'
    if (mixState.treeTable) {
      mixState.parentList = (await getParentList()) as AnyObject[]
    }
    resetForm()
    await getDictData()
    if (!mixState.isCreate) {
      await getFormData(id)
    }
    await mixHandlers.beforeOpen()
    mixState.visible = true
  }

  // 清除表单数据
  const resetForm = () => {
    ;(form.value as any)?.clearValidate()
    mixState.formData = cloneDeep(mixState.resetFormData) // JSON.parse(JSON.stringify(mixState.resetFormData))
    console.log(mixState.formData)
  }

  // 根据id获取数据
  const getFormData = async (id: string) => {
    if (mixState.getApi === needImplFunc) {
      return
    }
    try {
      mixState.formData[mixState.idField] = id
      const data = await mixState.getApi(id)
      if (mixState.treeTable) {
        data[mixState.treeFields.treeParentIdField] =
          data[mixState.treeFields.treeParentIdField] === '0' ? '' : data[mixState.treeFields.treeParentIdField]
      }
      await mixHandlers.afterGetData(data)
      mixState.formData = data
    } catch (e) {
      console.log(e)
    }
  }

  //===============================================================================
  // tree table
  //===============================================================================

  // 获取上级节点
  const getParentList = async () => {
    if (mixState.listApi === needImplFunc) {
      return
    }
    try {
      const { data: pl } = await mixState.listApi()
      return arrayToTree(pl, mixState.treeFields)
    } catch (e) {
      console.log(e)
    }
  }

  //===============================================================================
  // submit
  //===============================================================================

  // 提交
  const submit = async () => {
    if (mixState.isCreate && mixState.postApi === needImplFunc) {
      return
    }
    if (!mixState.isCreate && mixState.putApi === needImplFunc) {
      return
    }
    if (mixState.treeTable && !mixState.formData[mixState.treeFields.treeParentIdField]) {
      mixState.formData[mixState.treeFields.treeParentIdField] = '0'
    }
    if (!(await mixHandlers.beforeSubmit())) {
      return
    }
    try {
      await (form.value as any).validate()
      await mixHandlers.beforeSubmitData()
      if (mixState.isCreate) {
        await mixState.postApi(mixState.formData)
      } else {
        await mixState.putApi(mixState.formData)
      }
      hideDialog()
      emit(REFRESH_DATA_EVENT)
      ElMessage({
        message: '操作成功',
        type: 'success',
        duration: 1500
      })
    } catch (e) {
      console.log(e)
    }
  }

  // 隐藏弹窗
  const hideDialog = async () => {
    mixState.visible = false
    resetForm()
    await mixHandlers.afterClose()
  }

  //===============================================================================
  // utils
  //===============================================================================

  // 获取弹窗的标题
  const getFormTitle = () => {
    return mixState.isCreate ? `新增${mixState.title}` : `编辑${mixState.title}`
  }

  return {
    mixRefs: {
      form
    },
    mixState,
    mixMethods: {
      open,
      getDictData,
      getFormData,
      resetForm,
      submit,
      hideDialog,
      getFormTitle,
      onAfterGetData,
      onBeforeOpen,
      onBeforeSubmitData,
      onBeforeSubmit,
      onAfterClose
    }
  }
}