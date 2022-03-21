import { cloneDeep, merge } from 'lodash-es'
import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import useDict from '@/extend/crud/use-dict'
import { off, on } from '@/utils/dom'
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

  const mixState = reactive(merge({}, defaultState, stateOption) as typeof defaultState & DetailStateOption<T>)

  const mixHandlers = {
    // 显示之前
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    beforeOpen: async (data: T[], idx: number, extra?: Indexable) => {
      return
    },
    // 改变当前项之后
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentChanged: async (idx: number) => {
      return
    }
  }

  // 上一条按钮是否可用
  const prevDisabled = computed(() => {
    return mixState.idx <= 0
  })

  // 下一条按钮是否可用
  const nextDisabled = computed(() => {
    return mixState.idx >= mixState.data.length - 1
  })

  // idx改变时
  watch(
    () => mixState.idx,
    async (val: number) => {
      await mixHandlers.currentChanged(val)
    }
  )

  // 显示之前
  const onBeforeOpen = (fn: (data: T[], idx: number, extra?: Indexable) => Promise<void>) => {
    mixHandlers.beforeOpen = fn
  }

  // 改变当前项之后
  const onCurrentChanged = async (fn: (idx: number) => Promise<void>) => {
    mixHandlers.currentChanged = fn
  }

  // 显示
  const open = async (data: T[], idx: number, extra?: Indexable) => {
    await mixHandlers.beforeOpen(data, idx, extra)
    mixState.idx = idx
    mixState.data = data
    if (extra && extra.dicts) {
      mixState.dicts = { ...mixState.dicts, ...extra.dicts }
    }
    await mixHandlers.currentChanged(idx)
    mixState.visible = true
  }

  // 隐藏
  const close = () => {
    mixState.visible = false
    resetForm()
  }

  // 清除表单数据
  const resetForm = () => {
    mixState.data = [cloneDeep(mixState.resetFormData as T)]
    mixState.idx = 0
  }

  // 编辑当前项
  const onEdit = () => {
    mixState.visible = false
    emit(OPEN_EDIT_EVENT, mixState.data[mixState.idx][mixState.idField])
  }

  // 上一条数据
  const onPrev = () => {
    if (mixState.idx > 0) {
      mixState.idx -= 1
      emit(NAVIGATE_EVENT, mixState.data[mixState.idx].id)
    }
  }

  // 下一条数据
  const onNext = () => {
    if (mixState.idx < mixState.data.length - 1) {
      mixState.idx += 1
      emit(NAVIGATE_EVENT, mixState.data[mixState.idx].id)
    }
  }

  onMounted(() => {
    on(document, 'keyup', onKeyEvent)
  })

  onBeforeUnmount(() => {
    off(document, 'keyup', onKeyEvent)
  })

  const onKeyEvent = (evt: Event) => {
    const kEvt = evt as KeyboardEvent
    if (kEvt.code === 'ArrowLeft') {
      onPrev()
    } else if (kEvt.code === 'ArrowRight') {
      onNext()
    }
  }

  // 字典 utils
  const { getDictData, dictVal } = useDict(mixState.dicts)

  return {
    mixState,
    mixComputed: {
      prevDisabled,
      nextDisabled
    },
    mixMethods: {
      onBeforeOpen,
      onCurrentChanged,
      open,
      resetForm,
      getDictData,
      dictVal,
      onEdit,
      onPrev,
      onNext,
      onKeyEvent,
      close
    }
  }
}