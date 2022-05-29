import { cloneDeep, merge } from 'lodash-es'
import { computed, reactive } from 'vue'
import { AnyFunction, Indexable } from '@b/common/types'
import { DictList } from '@b/api/system/dict-item'
import { ApiObj } from '@b/api'

export type DetailDialog<T extends ApiObj> = {
  open: (data: T, size: number, idx: number, navigateFn: NavigateFn<T>, extra?: Indexable) => void
  close: () => void
}

export type DetailStateOption<T extends ApiObj> = Partial<{
  // 主键
  idField: string
  // 字典
  dicts: DictList
  // 重置表单
  resetFormData: Partial<T> | Indexable
  // 对话框标题
  title: string
  // 是否显示导航按钮
  ifShowNavigation: boolean
  // 是否显示编辑按钮
  ifEditable: boolean

  [key: string]: any
}>

export interface NavigateResult<T extends ApiObj> {
  prevEnabled?: boolean
  nextEnabled?: boolean
  idx: number
  data: T
}

export type NavigateFn<T extends ApiObj> = (direction: 'prev' | 'next') => NavigateResult<T>

export const OPEN_EDIT_EVENT = 'open-edit-dialog'

export default function <T extends ApiObj>(stateOption: DetailStateOption<T>, emit: AnyFunction) {
  //===============================================================================
  // state
  //===============================================================================

  const defaultState = {
    // 主键
    idField: 'id',
    // 当前数据
    data: {} as T,
    // 字典
    dicts: {} as DictList,
    // 当前数据索引
    idx: 0,
    // 当前页数据总数
    siz: 0,
    // 导航方法
    navigateFn: undefined as NavigateFn<T> | undefined,
    // 重置表单
    resetFormData: {} as Partial<T> | Indexable,
    // 对话框标题
    title: '',
    // 是否显示导航按钮
    ifShowNavigation: true,
    // 是否显示编辑按钮
    ifEditable: false,
    // 显示数据
    visible: false,
    // 向前导航是否可用
    prevEnabled: false,
    // 向后导航是否可用
    nextEnabled: true
  }

  const detailState = reactive(merge({}, defaultState, stateOption) as typeof defaultState & DetailStateOption<T>)

  //===============================================================================
  // handler
  //===============================================================================

  const mixHandlers = {
    // 显示之前
    beforeOpen: [
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (data: T, extra?: Indexable) => {
        return
      }
    ],
    // 改变当前项之后
    focusChanged: [
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (data: T) => {
        return
      }
    ]
  }

  // 显示之前
  const onBeforeOpen = (fn: (data: T, extra?: Indexable) => Promise<void>) => {
    mixHandlers.beforeOpen.push(fn)
  }

  // 改变当前项之后
  const onCurrentChanged = async (fn: (data: T) => Promise<void>) => {
    mixHandlers.focusChanged.push(fn)
  }

  //===============================================================================
  // open
  //===============================================================================

  // 显示
  const open = async (data: T, size: number, idx: number, navFn: NavigateFn<T>, extra?: Indexable) => {
    for (const fn of mixHandlers.beforeOpen) {
      await fn?.(data, extra)
    }

    ;(detailState.data as T) = data
    detailState.navigateFn = navFn
    if (extra && extra.dicts) {
      detailState.dicts = { ...detailState.dicts, ...extra.dicts }
    }
    detailState.idx = idx
    detailState.siz = size
    detailState.prevEnabled = idx > 0
    detailState.nextEnabled = idx < size - 1

    for (const fn of mixHandlers.focusChanged) {
      await fn?.(data)
    }
    detailState.visible = true
  }

  // 隐藏
  const close = () => {
    detailState.visible = false
    resetForm()
  }

  // 清除表单数据
  const resetForm = () => {
    ;(detailState.data as T) = cloneDeep(detailState.resetFormData as T)
    detailState.idx = 0
  }

  //===============================================================================
  // navigate
  //===============================================================================

  // 数据导航
  const onNavigate = async (direction: 'prev' | 'next') => {
    if (!detailState.navigateFn) {
      return
    }
    const { prevEnabled, nextEnabled, idx, data } = detailState.navigateFn(direction)
    prevEnabled !== undefined && (detailState.prevEnabled = prevEnabled)
    nextEnabled !== undefined && (detailState.nextEnabled = nextEnabled)
    detailState.idx = idx
    ;(detailState.data as T) = data
    for (const fn of mixHandlers.focusChanged) {
      await fn?.(data)
    }
  }

  //===============================================================================
  // open edit
  //===============================================================================

  // 编辑当前项
  const onEdit = () => {
    detailState.visible = false
    emit(OPEN_EDIT_EVENT, detailState.data[detailState.idField])
  }

  //===============================================================================
  // attrs
  //===============================================================================

  const actAttrs = computed(() => {
    return {
      navPrev: detailState.prevEnabled,
      navNext: detailState.nextEnabled,
      onEdit: onEdit,
      onPrev: onNavigate('prev'),
      onNext: onNavigate('next')
    }
  })

  return {
    detailState,
    detailMethods: {
      onBeforeOpen,
      onCurrentChanged,
      open,
      resetForm,
      onEdit,
      onNavigate,
      close
    },
    detailAttrs: {
      actAttrs
    }
  }
}
