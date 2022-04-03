import { cloneDeep, merge } from 'lodash-es'
import { computed, reactive, watch } from 'vue'
import { AnyFunction, Indexable } from '@/common/types'
import { DictList } from '@/api/system/dict-item'
import { ApiObj } from '@/api'
import { MaybeRef } from '@vueuse/core'

export type DetailDialog<T extends ApiObj> = {
  open: (data: T[], idx: number, extra?: Indexable) => void
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

export const OPEN_EDIT_EVENT = 'open-edit-dialog'
export const NAVIGATE_EVENT = 'navigate'

export default function <T extends ApiObj>(stateOption: DetailStateOption<T>, emit: AnyFunction) {
  //===============================================================================
  // state
  //===============================================================================

  const defaultState = {
    // 主键
    idField: 'id',
    // 当前数据索引
    idx: 0,
    // 数据列表
    data: [] as MaybeRef<T[]>,
    // 字典
    dicts: {} as DictList,
    // 重置表单
    resetFormData: {} as Partial<T> | Indexable,
    // 对话框标题
    title: '',
    // 是否显示导航按钮
    ifShowNavigation: true,
    // 是否显示编辑按钮
    ifEditable: false,
    // 显示数据
    visible: false
  }

  const detailState = reactive(merge({}, defaultState, stateOption) as typeof defaultState & DetailStateOption<T>)

  //===============================================================================
  // handler
  //===============================================================================

  const mixHandlers = {
    // 显示之前
    beforeOpen: [
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (data: T[], idx: number, extra?: Indexable) => {
        return
      }
    ],
    // 改变当前项之后
    currentChanged: [
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (idx: number) => {
        return
      }
    ]
  }

  // 显示之前
  const onBeforeOpen = (fn: (data: T[], idx: number, extra?: Indexable) => Promise<void>) => {
    mixHandlers.beforeOpen.push(fn)
  }

  // 改变当前项之后
  const onCurrentChanged = async (fn: (idx: number) => Promise<void>) => {
    mixHandlers.currentChanged.push(fn)
  }

  //===============================================================================
  // open
  //===============================================================================

  // 显示
  const open = async (data: T[], idx: number, extra?: Indexable) => {
    for (const fn of mixHandlers.beforeOpen) {
      await fn?.(data, idx, extra)
    }
    detailState.idx = idx
    detailState.data = data
    if (extra && extra.dicts) {
      detailState.dicts = { ...detailState.dicts, ...extra.dicts }
    }
    for (const fn of mixHandlers.currentChanged) {
      await fn?.(idx)
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
    detailState.data = [cloneDeep(detailState.resetFormData as T)]
    detailState.idx = 0
  }

  //===============================================================================
  // navigate
  //===============================================================================

  // 上一条按钮是否可用
  const prevEnabled = computed(() => {
    return detailState.idx > 0
  })

  // 下一条按钮是否可用
  const nextEnabled = computed(() => {
    return detailState.idx < detailState.data.length - 1
  })

  // idx改变时
  watch(
    () => detailState.idx,
    async (val: number) => {
      for (const fn of mixHandlers.currentChanged) {
        await fn?.(val)
      }
    }
  )

  // 上一条数据
  const onPrev = () => {
    if (detailState.idx > 0) {
      detailState.idx -= 1
      emit(NAVIGATE_EVENT, detailState.data[detailState.idx].id)
    }
  }

  // 下一条数据
  const onNext = () => {
    if (detailState.idx < detailState.data.length - 1) {
      detailState.idx += 1
      emit(NAVIGATE_EVENT, detailState.data[detailState.idx].id)
    }
  }

  //===============================================================================
  // open edit
  //===============================================================================

  // 编辑当前项
  const onEdit = () => {
    detailState.visible = false
    emit(OPEN_EDIT_EVENT, detailState.data[detailState.idx][detailState.idField])
  }

  //===============================================================================
  // attrs
  //===============================================================================

  const actAttrs = computed(() => {
    return {
      navPrev: prevEnabled.value,
      navNext: nextEnabled.value,
      onEdit: onEdit,
      onPrev: onPrev,
      onNext: onNext
    }
  })

  return {
    detailState,
    detailComputed: {
      prevEnabled,
      nextEnabled
    },
    detailMethods: {
      onBeforeOpen,
      onCurrentChanged,
      open,
      resetForm,
      onEdit,
      onPrev,
      onNext,
      close
    },
    detailAttrs: {
      actAttrs
    }
  }
}
