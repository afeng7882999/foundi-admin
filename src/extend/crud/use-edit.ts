import { cloneDeep, merge } from 'lodash-es'
import { reactive, ref, unref } from 'vue'
import { ElForm, ElMessage } from 'element-plus'
import useDict from '@/extend/crud/use-dict'
import { arrayToTree, TreeFields } from '@/utils/data-tree'
import { ApiObj } from '@/api'
import { AnyFunction, Indexable } from '@/common/types'
import { DictList } from '@/api/system/dict-item'
import { MaybeRef } from '@vueuse/core'
import { Ref } from '@vue/reactivity'

export type EditDialog = {
  open: (id: string) => void
}

export type ListEditStateOption<T extends ApiObj> = Partial<{
  // 主键
  idField: string
  // 是否为新增类型的表单
  isCreate: boolean
  // 字典
  dicts: DictList
  // 重置表单
  resetFormData: Partial<T> & Indexable
  // 标题
  title: string
  // 请求单独数据的api
  getApi: AnyFunction
  // 添加数据的api
  postApi: AnyFunction
  //修改数据的api
  putApi: AnyFunction

  [key: string]: any
}>

export type TreeEditStateOption<T extends ApiObj> = ListEditStateOption<T> &
  Partial<{
    // 是否是树表
    treeTable: boolean
    // 树表字段
    treeFields: TreeFields
  }> & {
    // 请求数据列表的api
    listApi: AnyFunction
  }

export const REFRESH_DATA_EVENT = 'refresh-data-list'

export default function <T extends ApiObj>(stateOption: ListEditStateOption<T> | TreeEditStateOption<T>, emit: AnyFunction) {
  //===============================================================================
  // ref
  //===============================================================================

  const form = ref() as Ref<InstanceType<typeof ElForm>>

  //===============================================================================
  // state
  //===============================================================================

  const defaultState = {
    // 主键
    idField: 'id',
    // 是否为新增类型的表单
    isCreate: false,
    // 表单
    formData: {} as MaybeRef<T | Indexable>,
    // 字典
    dicts: {} as DictList,
    // 重置表单
    resetFormData: {} as Partial<T> & Indexable,
    // 标题
    title: '',
    // 选择的项目
    selectedNodes: [] as T[],
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
    } as Partial<TreeFields>,
    // 上级节点
    parentList: [] as T[]
  }

  const mixState = stateOption.treeTable
    ? reactive(merge({}, defaultTreeState, stateOption) as typeof defaultTreeState & TreeEditStateOption<T>)
    : reactive(merge({}, defaultState, stateOption) as typeof defaultState & ListEditStateOption<T>)

  //===============================================================================
  // handler
  //===============================================================================

  const mixHandlers = {
    // 处理获取的数据
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    afterGetData: async (data: T) => {
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
  const onAfterGetData = (fn: (data: T) => Promise<void>) => {
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
      mixState.parentList = (await getParentList()) as T[]
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
    form.value?.clearValidate()
    mixState.formData = cloneDeep(mixState.resetFormData as T)
  }

  // 根据id获取数据
  const getFormData = async (id: string) => {
    if (!mixState.getApi) {
      return
    }
    try {
      unref<ApiObj>(mixState.formData)[mixState.idField] = id
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
    if (!mixState.listApi) {
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
    if (mixState.isCreate && !mixState.postApi) {
      return
    }
    if (!mixState.isCreate && !mixState.putApi) {
      return
    }
    if (mixState.treeTable && !mixState.formData[mixState.treeFields.treeParentIdField]) {
      ;(mixState.formData as ApiObj)[mixState.treeFields.treeParentIdField] = '0'
    }
    if (!(await mixHandlers.beforeSubmit())) {
      return
    }
    try {
      await (form.value as any).validate()
      await mixHandlers.beforeSubmitData()
      if (mixState.isCreate) {
        mixState.postApi && (await mixState.postApi(mixState.formData))
      } else {
        mixState.putApi && (await mixState.putApi(mixState.formData))
      }
      await hideDialog()
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