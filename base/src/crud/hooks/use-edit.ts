import { cloneDeep, merge } from 'lodash-es'
import { InjectionKey, provide, reactive, unref } from 'vue'
import useDict from './use-dict'
import { arrayToTree, TreeFields } from '@b/utils/data-tree'
import { ApiObj } from '@b/api'
import { AnyFunction, Indexable } from '@b/common/types'
import { DictList } from '@b/api/system/dict-item'
import { MaybeRef } from '@vueuse/core'

export type EditDialog = {
  open: (id?: string) => void
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

export interface EditContext {
  onValidate: (fn: () => Promise<void>) => void
  onClearValidate: (fn: () => void) => void
  onSubmitSuccess: (fn: () => void) => void
  onAfterGetData: (fn: (data: ApiObj) => Promise<void>) => void
  onBeforeOpen: (fn: () => Promise<void>) => void
  onBeforeSubmitData: (fn: () => Promise<void>) => void
  onBeforeSubmit: (fn: () => Promise<boolean>) => void
  onAfterClose: (fn: () => Promise<void>) => void
}
export const editContextKey: InjectionKey<Partial<EditContext>> = Symbol('editContextKey')

export default function <T extends ApiObj>(stateOption: ListEditStateOption<T> | TreeEditStateOption<T>, emit: AnyFunction) {
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

  const editState = stateOption.treeTable
    ? reactive(merge({}, defaultTreeState, stateOption) as typeof defaultTreeState & TreeEditStateOption<T>)
    : reactive(merge({}, defaultState, stateOption) as typeof defaultState & ListEditStateOption<T>)

  //===============================================================================
  // handler
  //===============================================================================

  const mixHandlers = {
    // 表单验证
    validate: [] as Array<() => Promise<void>>,
    // 清除表单验证
    clearValidate: [] as Array<() => void>,
    // 提交成功
    submitSuccess: [] as Array<() => void>,
    // 处理获取的数据
    afterGetData: [] as Array<(data: T) => Promise<void>>,
    // 页面显示之前
    beforeOpen: [] as Array<() => Promise<void>>,
    // 处理提交的数据
    beforeSubmitData: [] as Array<() => Promise<void>>,
    // 提交之前
    beforeSubmit: [] as Array<() => Promise<boolean>>,
    // 关闭之前
    afterClose: [] as Array<() => Promise<void>>
  }

  // 表单验证
  const onValidate = (fn: () => Promise<void>) => {
    mixHandlers.validate.push(fn)
  }

  // 清除表单验证
  const onClearValidate = (fn: () => void) => {
    mixHandlers.clearValidate.push(fn)
  }

  // 提交成功
  const onSubmitSuccess = (fn: () => void) => {
    mixHandlers.submitSuccess.push(fn)
  }

  // 处理获取的数据
  const onAfterGetData = (fn: (data: T) => Promise<void>) => {
    mixHandlers.afterGetData.push(fn)
  }

  // 页面显示之前
  const onBeforeOpen = (fn: () => Promise<void>) => {
    mixHandlers.beforeOpen.push(fn)
  }

  // 处理提交的数据
  const onBeforeSubmitData = (fn: () => Promise<void>) => {
    mixHandlers.beforeSubmitData.push(fn)
  }

  // 提交之前
  const onBeforeSubmit = (fn: () => Promise<boolean>) => {
    mixHandlers.beforeSubmit.push(fn)
  }

  // 关闭之前
  const onAfterClose = (fn: () => Promise<void>) => {
    mixHandlers.afterClose.push(fn)
  }

  //===============================================================================
  // open
  //===============================================================================

  const { getDictData } = useDict(editState.dicts)

  // 添加、编辑对话框
  const open = async (id?: string) => {
    editState.isCreate = !id || id === '-1'
    if (editState.treeTable) {
      editState.parentList = (await getParentList()) as T[]
    }
    resetForm()
    await getDictData()
    if (id) {
      await getFormData(id)
    }
    for (const fn of mixHandlers.beforeOpen) {
      await fn?.()
    }
    editState.visible = true
  }

  // 清除表单数据
  const resetForm = () => {
    for (const fn of mixHandlers.clearValidate) {
      fn?.()
    }
    editState.formData = cloneDeep(editState.resetFormData as T)
  }

  // 根据id获取数据
  const getFormData = async (id: string) => {
    if (!editState.getApi) {
      return
    }
    try {
      unref<ApiObj>(editState.formData)[editState.idField] = id
      const data = await editState.getApi(id)
      if (editState.treeTable) {
        data[editState.treeFields.treeParentIdField] =
          data[editState.treeFields.treeParentIdField] === '0' ? '' : data[editState.treeFields.treeParentIdField]
      }
      for (const fn of mixHandlers.afterGetData) {
        await fn?.(data)
      }
      editState.formData = data
    } catch (e) {
      console.log(e)
    }
  }

  //===============================================================================
  // tree table
  //===============================================================================

  // 获取上级节点
  const getParentList = async () => {
    if (!editState.listApi) {
      return
    }
    try {
      const { data: pl } = await editState.listApi()
      return arrayToTree(pl, editState.treeFields)
    } catch (e) {
      console.log(e)
    }
  }

  //===============================================================================
  // submit
  //===============================================================================

  // 提交
  const submit = async () => {
    if (editState.isCreate && !editState.postApi) {
      return
    }
    if (!editState.isCreate && !editState.putApi) {
      return
    }
    if (editState.treeTable && !editState.formData[editState.treeFields.treeParentIdField]) {
      ;(editState.formData as ApiObj)[editState.treeFields.treeParentIdField] = '0'
    }
    for (const fn of mixHandlers.beforeSubmit) {
      if (!(await fn?.())) {
        return
      }
    }
    try {
      for (const fn of mixHandlers.validate) {
        await fn?.()
      }
      for (const fn of mixHandlers.beforeSubmitData) {
        await fn?.()
      }
      if (editState.isCreate) {
        editState.postApi && (await editState.postApi(editState.formData))
      } else {
        editState.putApi && (await editState.putApi(editState.formData))
      }
      await hideDialog()
      emit(REFRESH_DATA_EVENT)
      for (const fn of mixHandlers.submitSuccess) {
        fn?.()
      }
    } catch (e) {
      console.log(e)
    }
  }

  // 隐藏弹窗
  const hideDialog = async () => {
    editState.visible = false
    resetForm()
    for (const fn of mixHandlers.afterClose) {
      await fn?.()
    }
  }

  //===============================================================================
  // utils
  //===============================================================================

  // 获取弹窗的标题
  const getFormTitle = () => {
    return editState.isCreate ? `新增${editState.title}` : `编辑${editState.title}`
  }

  //===============================================================================
  // inject
  //===============================================================================

  provide(editContextKey, {
    onValidate,
    onClearValidate,
    onSubmitSuccess,
    onAfterGetData,
    onBeforeOpen,
    onBeforeSubmitData,
    onBeforeSubmit,
    onAfterClose
  })

  return {
    editState,
    editMethods: {
      open,
      getDictData,
      getFormData,
      resetForm,
      submit,
      hideDialog,
      getFormTitle,
      onValidate,
      onClearValidate,
      onSubmitSuccess,
      onAfterGetData,
      onBeforeOpen,
      onBeforeSubmitData,
      onBeforeSubmit,
      onAfterClose
    }
  }
}
