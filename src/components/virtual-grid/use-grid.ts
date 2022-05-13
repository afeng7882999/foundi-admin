import {
  BufferMeta,
  OFFSET_CHANGED_EVENT,
  GRID_DEFAULT_PROPS,
  GridMeasurement,
  InternalItem,
  ItemsByPage,
  PageProvider,
  ResizeMeasurement,
  BUFFER_REFRESHED_EVENT
} from './types'
import { clamp, concat, difference, isEqual, parseInt, range } from 'lodash-es'
import { ExtractPropTypes, onMounted, onUnmounted, reactive, toRefs, watch } from 'vue'
import { Ref } from '@vue/reactivity'
import { useDebounceFn, useResizeObserver } from '@vueuse/core'
import { nextFrame } from '@/utils/next-frame'
import { AnyFunction } from '@/common/types'

/**
 * Get scrollable parent
 */
const getVerticalScrollParent = (el: Element, includeHidden = false): Element => {
  const style = getComputedStyle(el)
  const excludeStaticParent = style.position === 'absolute'
  const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/
  if (style.position === 'fixed') {
    return document.body
  }
  for (let parent: Element | null = el; (parent = parent.parentElement); ) {
    const parentStyle = getComputedStyle(parent)
    if (excludeStaticParent && parentStyle.position === 'static') {
      continue
    }
    if (overflowRegex.test(parentStyle.overflow + parentStyle.overflowY)) return parent
  }
  return document.scrollingElement || document.documentElement
}

/**
 * Get height above window/wrapper
 */
const getHeightAbove = (viewEl: Element, wrapperEl?: Element): number => {
  if (wrapperEl) {
    const top = viewEl.getBoundingClientRect().top - wrapperEl.getBoundingClientRect().top
    return Math.ceil(Math.abs(Math.min(top, 0)))
  }
  // window mode
  const top = viewEl.getBoundingClientRect().top
  return Math.ceil(Math.abs(Math.min(top, 0)))
}

/**
 * Get measurement of grid layout
 */
const getGridMeasurement = (innerEl: Element): GridMeasurement => {
  const style = window.getComputedStyle(innerEl)
  return {
    rowGap: parseInt(style.getPropertyValue('row-gap')) || 0,
    columns: style.getPropertyValue('grid-template-columns').split(' ').length
  }
}

/**
 * Get Resize measurement of grid and item
 */
const getResizeMeasurement = (rootEl: Element, itemH: number): ResizeMeasurement => {
  const { rowGap, columns } = getGridMeasurement(rootEl)
  return {
    rowGap,
    columns,
    itemHeightWithGap: itemH + rowGap
  }
}

/**
 * Get first item index of last row above window/wrapper
 */
const getOffsetBeforeView = (heightAbove: number, rm: ResizeMeasurement): number => {
  const rowsBeforeView = rm.itemHeightWithGap && Math.floor((heightAbove + rm.rowGap) / rm.itemHeightWithGap)
  return rowsBeforeView * rm.columns
}

/**
 * Get buffer measurement
 */
const getBufferMeta = (wrapperHeight: number, heightAbove: number, rm: ResizeMeasurement): BufferMeta => {
  const rowsInView = rm.itemHeightWithGap && Math.ceil((wrapperHeight + rm.rowGap) / rm.itemHeightWithGap) + 1
  const length = rowsInView * rm.columns

  const offset = getOffsetBeforeView(heightAbove, rm)
  const bufferedOffset = Math.max(offset - Math.floor(rowsInView / 2) * rm.columns, 0)
  const bufferedLength = length * 2

  return {
    columns: rm.columns,
    bufferedOffset,
    bufferedLength
  }
}

/**
 * Get numbers of pages overlapped with buffer
 */
const getVisiblePageNumbers = ({ bufferedOffset, bufferedLength }: BufferMeta, length: number, pageSize: number): number[] => {
  const startPage = Math.floor(bufferedOffset / pageSize)
  const endPage = Math.ceil(Math.min(bufferedOffset + bufferedLength, length) / pageSize)
  return range(startPage, endPage)
}

/**
 * Call provider and request data from backend
 */
const callPageProvider = async (pageNumbers: number[], pageSize: number, pageProvider: PageProvider): Promise<ItemsByPage[]> => {
  const itemsByPages = [] as ItemsByPage[]
  for (const pageNumber of pageNumbers) {
    const items = await pageProvider(pageNumber + 1, pageSize)
    itemsByPages.push({
      pageNumber,
      items
    })
  }
  return itemsByPages
}

/**
 * Calculate buffer, set item not fetched undefined
 */
const getBufferItems = (
  itemsByPages: ItemsByPage[],
  { bufferedOffset, bufferedLength }: BufferMeta,
  length: number,
  pageSize: number
): InternalItem[] => {
  const pageItems = itemsByPages.map((i) => i.items).reduce((total: unknown[], its: unknown[]) => concat(total, its), [])
  if (pageItems.length === 0) {
    return []
  }
  const visibleItems = pageItems.slice(
    Math.max(bufferedOffset - itemsByPages[0].pageNumber * pageSize, 0),
    Math.max(bufferedOffset + bufferedLength - itemsByPages[0].pageNumber * pageSize, 0)
  )
  const prependLen = clamp(itemsByPages[0].pageNumber * pageSize - bufferedOffset, 0, bufferedLength)
  const emptyPrepend = new Array(prependLen).fill(undefined)
  const itemsTail = itemsByPages[itemsByPages.length - 1].pageNumber * pageSize + pageSize
  const appendMaxLen = bufferedLength - Math.max(bufferedOffset + bufferedLength - length, 0)
  const appendLen = clamp(Math.min(bufferedOffset + bufferedLength, length) - itemsTail, 0, appendMaxLen)
  const emptyAppend = new Array(appendLen).fill(undefined)
  const buffer = concat(emptyPrepend, visibleItems, emptyAppend)

  return buffer.map((value, localIndex) => {
    const index = bufferedOffset + localIndex
    return {
      index,
      localIndex,
      value
    }
  })
}

/**
 * Get height of view wrapper div
 */
const getViewHeight = ({ columns, rowGap, itemHeightWithGap }: ResizeMeasurement, length: number): number => {
  return itemHeightWithGap * Math.ceil(length / columns) - rowGap
}

/**
 * Check if scrolling reaches the refresh margin, refresh inner wrapper div if true
 */
const reachRefreshSpan = (bufferMeta: BufferMeta, oldBufferOffset: number, length: number, refreshSpan?: number): boolean => {
  if (oldBufferOffset !== 0 && bufferMeta.bufferedOffset === 0) {
    return true
  }
  const bottomHead = length - bufferMeta.bufferedLength
  if (oldBufferOffset < bottomHead && bufferMeta.bufferedOffset >= bottomHead) {
    return true
  }
  refreshSpan = refreshSpan === undefined ? Math.floor(bufferMeta.bufferedLength / 8) : refreshSpan
  return Math.abs(bufferMeta.bufferedOffset - oldBufferOffset) > refreshSpan
}

/**
 * Get grid item height
 */
const getItemHeight = (innerEl: Element, height?: number): number => {
  if (height !== undefined) {
    return height
  }
  const firstChildEl = innerEl.firstElementChild
  const firstChildRect = firstChildEl ? firstChildEl.getBoundingClientRect() : ({ width: 0, height: 0 } as DOMRectReadOnly)
  return firstChildRect.height
}

export default function useGrid(
  props: Readonly<ExtractPropTypes<typeof GRID_DEFAULT_PROPS>>,
  emit: AnyFunction,
  wrapperRef: Ref<HTMLElement | undefined>,
  viewRef: Ref<HTMLElement | undefined>,
  innerRef: Ref<HTMLElement | undefined>
) {
  let heightAbove = 0
  let visiblePageNumbers = [] as number[]
  let resizeMeasurement = {} as ResizeMeasurement
  let itemByPages = [] as ItemsByPage[]
  let bufferOffset = 0
  let bufferMeta = {} as BufferMeta
  let currentIdx = 0
  let scrollEl = undefined as Element | Window | undefined

  const state = reactive({
    initialized: false,
    wrapperRect: {} as DOMRectReadOnly,
    itemHeight: props.itemHeight ?? 100,
    buffer: [] as InternalItem[],
    viewHeight: 0,
    innerTranslate: 0
  })

  /**
   * Get wrapper div height
   */
  const getWrapperHeight = () => {
    return props.windowMode ? window.innerHeight : (wrapperRef.value as Element).getBoundingClientRect().height
  }

  /**
   * Calculate buffer
   */
  const getBuffer = async (): Promise<void> => {
    const wrapperHeight = getWrapperHeight()
    bufferMeta = getBufferMeta(wrapperHeight, heightAbove, resizeMeasurement)
    const visiblePn = getVisiblePageNumbers(bufferMeta, props.length as number, props.pageSize as number)
    const pageChanged = difference(visiblePn, visiblePageNumbers).length > 0
    const needRefresh = reachRefreshSpan(bufferMeta, bufferOffset, props.length as number)
    if (pageChanged) {
      visiblePageNumbers = visiblePn
      await getBufferRemoteDebounce()
    }
    if (pageChanged || needRefresh) {
      bufferOffset = bufferMeta.bufferedOffset
      state.buffer = getBufferItems(itemByPages, bufferMeta, props.length as number, props.pageSize as number)
      state.innerTranslate = (bufferMeta.bufferedOffset / bufferMeta.columns) * resizeMeasurement.itemHeightWithGap
    }
    if (!pageChanged && needRefresh) {
      emitBufferRefreshedDebounce()
    }
  }

  /**
   * Request buffer data from backend
   */
  const getBufferRemote = async () => {
    callPageProvider(visiblePageNumbers, props.pageSize as number, props.pageProvider as PageProvider).then((items) => {
      const itemPn = items.map((i) => i.pageNumber)
      if (isEqual(visiblePageNumbers, itemPn)) {
        itemByPages = items
        state.buffer = getBufferItems(itemByPages, bufferMeta, props.length as number, props.pageSize as number)
        state.innerTranslate = (bufferMeta.bufferedOffset / bufferMeta.columns) * resizeMeasurement.itemHeightWithGap
        emitBufferRefreshed()
      }
    })
  }
  const getBufferRemoteDebounce = useDebounceFn(getBufferRemote, props.pageProviderDebounceTime as number)

  /**
   * Callback of ResizeObserver
   */
  const resizeObserverCb = async () => {
    if (!state.initialized || !viewRef.value) {
      return
    }
    const viewEl = viewRef.value as Element
    heightAbove = props.windowMode ? getHeightAbove(viewEl) : getHeightAbove(viewEl, wrapperRef.value as Element)
    state.itemHeight = getItemHeight(innerRef.value as Element, props.itemHeight)
    resizeMeasurement = getResizeMeasurement(innerRef.value as Element, state.itemHeight)
    emitCurrentItem()
    state.viewHeight = getViewHeight(resizeMeasurement, props.length as number)
    await getBuffer()
  }
  const resizeObserverCbDebounce = useDebounceFn(resizeObserverCb, 300)

  /**
   * Callback of wrapper scrolling
   */
  const scrollCb = async () => {
    if (!state.initialized || !viewRef.value) {
      return
    }
    heightAbove = props.windowMode
      ? getHeightAbove(viewRef.value as Element)
      : getHeightAbove(viewRef.value as Element, wrapperRef.value as Element)
    emitCurrentItemDebounce()
    state.viewHeight = getViewHeight(resizeMeasurement, props.length as number)
    await getBuffer()
  }

  /**
   * Add scroll event listener
   */
  const addScrollEventListener = (windowMode: boolean) => {
    scrollEl = windowMode ? window : getVerticalScrollParent(viewRef.value as Element)
    scrollEl.addEventListener('scroll', scrollCb)
  }

  /**
   * Initialize the grid after component is mounted
   */
  const init = async () => {
    // initialize the grid and scroll to initIndex
    const initGrid = async () => {
      resizeMeasurement = getResizeMeasurement(innerRef.value as Element, state.itemHeight)
      state.viewHeight = getViewHeight(resizeMeasurement, props.length as number)
      const wrapperHeight = getWrapperHeight()
      bufferMeta = getBufferMeta(wrapperHeight, heightAbove, resizeMeasurement)
      visiblePageNumbers = getVisiblePageNumbers(bufferMeta, props.length as number, props.pageSize as number)

      addScrollEventListener(props.windowMode)

      await nextFrame(() => {
        props.initIndex && scrollToIdx(props.initIndex as number, false)
        state.initialized = true
      })
    }

    // initialize the buffer
    const initBuffer = async () => {
      const wrapperHeight = getWrapperHeight()
      resizeMeasurement = getResizeMeasurement(innerRef.value as Element, state.itemHeight)
      bufferMeta = getBufferMeta(wrapperHeight, heightAbove, resizeMeasurement)
      bufferMeta.bufferedLength = props.pageSize as number
      itemByPages = await callPageProvider([0], props.pageSize as number, props.pageProvider as PageProvider)
      state.buffer = getBufferItems(itemByPages, bufferMeta, props.length as number, props.pageSize as number)
    }

    await initBuffer()
    await nextFrame(() => {
      if (!viewRef.value || !innerRef.value) {
        return
      }
      state.itemHeight = getItemHeight(innerRef.value as Element, props.itemHeight)
      initGrid()
    })
  }

  useResizeObserver(wrapperRef, async (entries) => {
    if (!state.initialized || !viewRef.value) {
      return
    }
    state.wrapperRect = entries[0].contentRect
    await resizeObserverCbDebounce()
  })

  onMounted(async () => {
    await init()
  })

  onUnmounted(() => {
    scrollEl?.removeEventListener('scroll', scrollCb)
  })

  watch(
    () => props.length,
    (val) => {
      if (val === undefined) {
        return
      }
      state.viewHeight = getViewHeight(resizeMeasurement, val)
    }
  )

  watch(
    () => props.windowMode,
    (val) => {
      scrollEl?.removeEventListener('scroll', scrollCb)
      nextFrame(() => {
        addScrollEventListener(val)
      })
    }
  )

  /**
   * Emit current item index and page
   */
  const emitCurrentItem = () => {
    const index = getOffsetBeforeView(heightAbove, resizeMeasurement)
    if (currentIdx !== index) {
      currentIdx = index
      const localIndex = index - bufferOffset
      const page = Math.ceil((index + resizeMeasurement.columns) / (props.pageSize as number))
      emit(OFFSET_CHANGED_EVENT, { index, localIndex, page })
    }
  }
  const emitCurrentItemDebounce = useDebounceFn(emitCurrentItem, 300)

  /**
   * Emit after buffer changed
   */
  const emitBufferRefreshed = () => {
    emit(BUFFER_REFRESHED_EVENT, { index: currentIdx, localIndex: currentIdx - bufferOffset, buffer: state.buffer })
  }
  const emitBufferRefreshedDebounce = useDebounceFn(emitBufferRefreshed, 300)

  /**
   * Scroll to item with a specific index
   */
  const scrollToIdx = (idx: number, smooth = true): void => {
    idx = Math.max(idx, 0)
    if (idx === 0) {
      // just scroll to top
      scrollEl?.scrollTo({ top: 0, behavior: smooth ? 'smooth' : undefined })
      return
    }
    const viewEl = viewRef.value as HTMLElement
    const topToView = props.windowMode ? viewEl.getBoundingClientRect().top + window.scrollY : 0
    const scrollTop = Math.floor(idx / resizeMeasurement.columns) * resizeMeasurement.itemHeightWithGap + topToView
    scrollEl?.scrollTo({ top: scrollTop, behavior: smooth ? 'smooth' : undefined })
  }

  /**
   * Scroll to specific page
   */
  const scrollToPage = (pageNumber: number, smooth = true): void => {
    scrollToIdx((pageNumber - 1) * props.pageSize, smooth)
  }

  /**
   * Refresh grid, fetch data from backend
   */
  const refresh = async (): Promise<void> => {
    heightAbove = 0
    visiblePageNumbers = []
    await init()
  }

  /**
   * Refresh grid buffer, not trigger scrolling
   */
  const refreshBuffer = async (): Promise<void> => {
    callPageProvider(visiblePageNumbers, props.pageSize as number, props.pageProvider as PageProvider).then((items) => {
      itemByPages = items
      state.buffer = getBufferItems(itemByPages, bufferMeta, props.length as number, props.pageSize as number)
    })
  }

  const { initialized, wrapperRect, itemHeight, buffer, viewHeight, innerTranslate } = toRefs(state)
  return {
    initialized,
    wrapperRect,
    itemHeight,
    viewHeight,
    innerTranslate,
    buffer,
    scrollToIdx,
    scrollToPage,
    refresh,
    refreshBuffer
  }
}
