import { cloneDeep, merge } from 'lodash-es'
import { computed, onBeforeUnmount, onMounted, reactive } from 'vue'
import useDict, { IDictList } from '@/components/crud/use-dict'
import { AnyFunction, AnyObject } from '@/utils'
import { off, on } from '@/utils/dom'

export interface IDetailStateOption {
  // 主键
  idField?: string
  // 字典
  dicts?: IDictList
  // 重置表单
  resetFormData?: AnyObject
  // 对话框标题
  title?: string
  // 是否显示导航按钮
  ifShowNavigation?: boolean
  // 是否显示编辑按钮
  ifEditable?: boolean

  [key: string]: any
}

export const OPEN_EDIT_EVENT = 'open-edit-dialog'

export default function <T extends IDetailStateOption>(stateOption: T, emit: AnyFunction) {
  const defaultState = {
    // 主键
    idField: 'id',
    // 当前数据索引
    idx: 0,
    // 数据列表
    data: [] as AnyObject[],
    // 字典
    dicts: {} as IDictList,
    // 重置表单
    resetFormData: {} as AnyObject,
    // 对话框标题
    title: '',
    // 是否显示导航按钮
    ifShowNavigation: true,
    // 是否显示编辑按钮
    ifEditable: false,
    // 显示数据
    visible: false
  }

  const mixState = reactive(merge({}, defaultState, stateOption) as typeof defaultState & T)

  const mixHandlers = {
    // 显示之前
    beforeOpen: async (data: AnyObject[], idx: number, extra?: AnyObject) => {
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

  // 显示之前
  const onBeforeOpen = (fn: (data: AnyObject[], idx: number, extra?: AnyObject) => Promise<void>) => {
    mixHandlers.beforeOpen = fn
  }

  // 字典 utils
  const { getDictData, dictVal } = useDict(mixState.dicts)

  // 显示
  const open = async (data: AnyObject[], idx: number, extra?: AnyObject) => {
    await mixHandlers.beforeOpen(data, idx, extra)
    mixState.idx = idx
    mixState.data = data
    if (extra && extra.dicts) {
      mixState.dicts = { ...mixState.dicts, ...extra.dicts }
    }
    mixState.visible = true
  }

  // 清除表单数据
  const resetForm = () => {
    mixState.data = [cloneDeep(mixState.resetFormData)]
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
    }
  }

  // 下一条数据
  const onNext = () => {
    if (mixState.idx < mixState.data.length - 1) {
      mixState.idx += 1
    }
  }

  // 隐藏
  const close = () => {
    mixState.visible = false
    resetForm()
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

  return {
    mixState,
    mixComputed: {
      prevDisabled,
      nextDisabled
    },
    mixMethods: {
      onBeforeOpen,
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
