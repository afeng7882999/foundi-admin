import {
  BufferMeta,
  CURRENT_CHANGED_EVENT,
  GRID_PROPS,
  GridMeasurement,
  InternalItem,
  ItemsByPage,
  PageProvider,
  ResizeMeasurement
} from './types'
import { clamp, concat, difference, isEqual, parseInt, range } from 'lodash-es'
import { ExtractPropTypes, onMounted, reactive, toRefs, watch } from 'vue'
import { Ref } from '@vue/reactivity'
import { useDebounceFn, useEventListener, useResizeObserver } from '@vueuse/core'
import { nextFrame } from '@/utils/next-frame'
import { AnyFunction } from '@/common/types'

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

const getGridMeasurement = (rootEl: Element): GridMeasurement => {
  const style = window.getComputedStyle(rootEl)
  return {
    rowGap: parseInt(style.getPropertyValue('row-gap')) || 0,
    colGap: parseInt(style.getPropertyValue('column-gap')) || 0,
    columns: style.getPropertyValue('grid-template-columns').split(' ').length
  }
}

const getResizeMeasurement = (rootEl: Element, itemW: number, itemH: number): ResizeMeasurement => {
  const { rowGap, colGap, columns } = getGridMeasurement(rootEl)
  return {
    rowGap,
    columns,
    itemHeightWithGap: itemH + rowGap,
    itemWidthWithGap: itemW + colGap
  }
}

const getOffsetBeforeView = (heightAboveWrapper: number, rm: ResizeMeasurement): number => {
  const rowsBeforeView = rm.itemHeightWithGap && Math.floor((heightAboveWrapper + rm.rowGap) / rm.itemHeightWithGap)
  return rowsBeforeView * rm.columns
}

const getBufferMeta = (wrapperHeight: number, heightAboveWrapper: number, rm: ResizeMeasurement): BufferMeta => {
  const rowsInView = rm.itemHeightWithGap && Math.ceil((wrapperHeight + rm.rowGap) / rm.itemHeightWithGap) + 1
  const length = rowsInView * rm.columns

  const offset = getOffsetBeforeView(heightAboveWrapper, rm)
  const bufferedOffset = Math.max(offset - Math.floor(rowsInView / 2) * rm.columns, 0)
  const bufferedLength = length * 2

  return {
    columns: rm.columns,
    bufferedOffset,
    bufferedLength
  }
}

const getVisiblePageNumbers = ({ bufferedOffset, bufferedLength }: BufferMeta, length: number, pageSize: number): number[] => {
  const startPage = Math.floor(bufferedOffset / pageSize)
  const endPage = Math.ceil(Math.min(bufferedOffset + bufferedLength, length) / pageSize)
  return range(startPage, endPage)
}

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
      value
    }
  })
}

const getContentHeight = ({ columns, rowGap, itemHeightWithGap }: ResizeMeasurement, length: number): number => {
  return itemHeightWithGap * Math.ceil(length / columns) - rowGap
}

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

const getItemHeight = (innerEl: Element, height?: number): number => {
  if (height !== undefined) {
    return height
  }
  const firstChildEl = innerEl.firstElementChild
  const firstChildRect = firstChildEl ? firstChildEl.getBoundingClientRect() : ({ width: 0, height: 0 } as DOMRectReadOnly)
  return firstChildRect.height
}

export default function useGrid(
  props: Readonly<ExtractPropTypes<typeof GRID_PROPS>>,
  emit: AnyFunction,
  wrapperRef: Ref<HTMLElement | undefined>,
  viewRef: Ref<HTMLElement | undefined>,
  innerRef: Ref<HTMLElement | undefined>
) {
  let initialized = false
  let itemHeight = props.itemHeight ?? 100
  let heightAboveWrapper = 0
  let visiblePageNumbers = [] as number[]
  let resizeMeasurement = {} as ResizeMeasurement
  let itemByPages = [] as ItemsByPage[]
  let bufferOffset = 0
  let bufferMeta = {} as BufferMeta
  let currentIdx = 0

  const state = reactive({
    wrapperRect: {} as DOMRectReadOnly,
    buffer: [] as InternalItem[],
    contentHeight: 0,
    contentTranslate: 0
  })

  const getBuffer = async (): Promise<void> => {
    const wrapperHeight = props.pageMode ? window.innerHeight : (wrapperRef.value as Element).clientHeight
    bufferMeta = getBufferMeta(wrapperHeight, heightAboveWrapper, resizeMeasurement)
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
      state.contentTranslate = (bufferMeta.bufferedOffset / bufferMeta.columns) * resizeMeasurement.itemHeightWithGap
    }
  }

  const getBufferRemote = async () => {
    callPageProvider(visiblePageNumbers, props.pageSize as number, props.pageProvider as PageProvider).then((items) => {
      const itemPn = items.map((i) => i.pageNumber)
      if (isEqual(visiblePageNumbers, itemPn)) {
        itemByPages = items
        state.buffer = getBufferItems(itemByPages, bufferMeta, props.length as number, props.pageSize as number)
        state.contentTranslate = (bufferMeta.bufferedOffset / bufferMeta.columns) * resizeMeasurement.itemHeightWithGap
      }
    })
  }

  const getBufferRemoteDebounce = useDebounceFn(getBufferRemote, props.pageProviderDebounceTime as number)

  const getHeightAbove = (viewEl: Element, wrapperRect?: DOMRectReadOnly): number => {
    if (props.pageMode || !wrapperRect) {
      const top = viewEl.getBoundingClientRect().top
      return Math.abs(Math.min(top, 0))
    }
    const top = viewEl.getBoundingClientRect().top - wrapperRect.top
    return Math.abs(Math.min(top, 0))
  }

  const emitCurrentItem = () => {
    const index = getOffsetBeforeView(heightAboveWrapper, resizeMeasurement)
    if (currentIdx !== index) {
      currentIdx = index
      const page = Math.ceil((index + resizeMeasurement.columns * 2 - 1) / (props.pageSize as number))
      emit(CURRENT_CHANGED_EVENT, index, page)
    }
  }

  const emitCurrentItemDebounce = useDebounceFn(emitCurrentItem, 300)

  const resizeObserverCb = async (wrapperRect: DOMRectReadOnly) => {
    const viewEl = viewRef.value as Element
    heightAboveWrapper = getHeightAbove(viewEl, wrapperRect)
    itemHeight = getItemHeight(innerRef.value as Element, props.itemHeight)
    resizeMeasurement = getResizeMeasurement(innerRef.value as Element, props.itemWidth as number, itemHeight)
    emitCurrentItem()
    state.contentHeight = getContentHeight(resizeMeasurement, props.length as number)
    await getBuffer()
  }

  const resizeObserverCbDebounce = useDebounceFn(resizeObserverCb, 300)

  useResizeObserver(wrapperRef, async (entries) => {
    state.wrapperRect = entries[0].contentRect
    initialized && (await resizeObserverCbDebounce(entries[0].contentRect))
  })

  onMounted(async () => {
    await initItems()
  })

  const initItems = async () => {
    let wrapperHeight = 0
    if (props.pageMode) {
      wrapperHeight = window.innerHeight
    } else {
      state.wrapperRect = (wrapperRef.value as Element).getBoundingClientRect()
      wrapperHeight = state.wrapperRect.height
    }

    resizeMeasurement = getResizeMeasurement(innerRef.value as Element, props.itemWidth as number, itemHeight)
    bufferMeta = getBufferMeta(wrapperHeight, heightAboveWrapper, resizeMeasurement)

    itemByPages = await callPageProvider([0], props.pageSize as number, props.pageProvider as PageProvider)
    state.buffer = getBufferItems(itemByPages, bufferMeta, props.length as number, props.pageSize as number)

    await nextFrame(() => {
      itemHeight = getItemHeight(innerRef.value as Element, props.itemHeight)
      resizeMeasurement = getResizeMeasurement(innerRef.value as Element, props.itemWidth as number, itemHeight)
      state.contentHeight = getContentHeight(resizeMeasurement, props.length as number)
      getBuffer()
    })

    initialized = true
  }

  useEventListener(
    'scroll',
    async () => {
      heightAboveWrapper = getHeightAbove(viewRef.value as Element)
      emitCurrentItemDebounce()
      await getBuffer()
    },
    {
      capture: true,
      passive: true
    }
  )

  watch(
    () => props.length,
    (val) => {
      if (val === undefined) {
        return
      }
      state.contentHeight = getContentHeight(resizeMeasurement, val)
    }
  )

  const scrollToIdx = (idx: number): void => {
    idx = Math.max(idx, 0)
    const viewEl = viewRef.value as HTMLElement
    const verticalScrollEl = getVerticalScrollParent(viewEl) as HTMLElement
    const computedStyle = window.getComputedStyle(viewEl)
    const viewPaddingTop = parseInt(computedStyle.getPropertyValue('padding-top'))
    const viewBorderTop = parseInt(computedStyle.getPropertyValue('border-top'))
    const topToView = verticalScrollEl instanceof Element ? viewEl.offsetTop - verticalScrollEl.offsetTop : 0
    const scrollTop =
      Math.floor(idx / resizeMeasurement.columns) * resizeMeasurement.itemHeightWithGap + topToView + viewPaddingTop + viewBorderTop
    verticalScrollEl.scrollTo({ top: scrollTop, behavior: 'smooth' })
  }

  const { wrapperRect, buffer, contentHeight, contentTranslate } = toRefs(state)
  return {
    wrapperRect,
    contentHeight,
    contentTranslate,
    buffer,
    scrollToIdx
  }
}
