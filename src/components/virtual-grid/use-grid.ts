import { BufferMeta, GRID_PROPS, GridMeasurement, InternalItem, ItemsByPage, PageProvider, ResizeMeasurement } from './types'
import { clamp, concat, difference, isEqual, parseInt, range } from 'lodash-es'
import { computed, ExtractPropTypes, reactive, toRefs, watch } from 'vue'
import { Ref } from '@vue/reactivity'
import { useDebounceFn, useEventListener, useResizeObserver } from '@vueuse/core'

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

const getBufferMeta = (
  wrapperHeight: number,
  heightAboveWrapper: number,
  { columns, rowGap, itemHeightWithGap }: ResizeMeasurement
): BufferMeta => {
  const rowsInView = itemHeightWithGap && Math.ceil((wrapperHeight + rowGap) / itemHeightWithGap) + 1
  const length = rowsInView * columns

  const rowsBeforeView = itemHeightWithGap && Math.floor((heightAboveWrapper + rowGap) / itemHeightWithGap)
  const offset = rowsBeforeView * columns
  const bufferedOffset = Math.max(offset - Math.floor(rowsInView / 2) * columns, 0)
  const bufferedLength = length * 2

  return {
    columns,
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

export default function useGrid(
  props: Readonly<ExtractPropTypes<typeof GRID_PROPS>>,
  wrapperRef: Ref<HTMLElement | undefined>,
  viewRef: Ref<HTMLElement | undefined>,
  innerRef: Ref<HTMLElement | undefined>
) {
  let heightAboveWrapper = 0
  let visiblePageNumbers = [] as number[]
  let resizeMeasurement = {} as ResizeMeasurement
  let itemByPages = [] as ItemsByPage[]
  let bufferOffset = 0
  let bufferMeta = {} as BufferMeta

  const state = reactive({
    buffer: [] as InternalItem[],
    contentHeight: 0,
    contentTranslate: 0
  })

  const pageMode = computed(() => {
    return !props.wrapperHeight
  })

  const getBuffer = async (): Promise<void> => {
    const wrapperHeight = pageMode.value ? window.innerHeight : (wrapperRef.value as HTMLElement).clientHeight
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

  const getHeightAboveWrapper = (el: Element): number => {
    if (pageMode.value) {
      const top = el.getBoundingClientRect().top
      return Math.abs(Math.min(top, 0))
    }
    const wrapperEl = wrapperRef.value as HTMLElement
    const top = el.getBoundingClientRect().top - wrapperEl.getBoundingClientRect().top
    return Math.abs(Math.min(top, 0))
  }

  useResizeObserver(viewRef, async (entries) => {
    heightAboveWrapper = getHeightAboveWrapper(entries[0].target)
    resizeMeasurement = getResizeMeasurement(innerRef.value as HTMLElement, props.itemWidth as number, props.itemHeight as number)
    state.contentHeight = getContentHeight(resizeMeasurement, props.length as number)
    await getBuffer()
  })

  useEventListener(
    'scroll',
    async () => {
      heightAboveWrapper = getHeightAboveWrapper(viewRef.value as HTMLElement)
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
    const verticalScrollEl = getVerticalScrollParent(viewEl)
    const computedStyle = window.getComputedStyle(viewEl)
    const rootPaddingTop = parseInt(computedStyle.getPropertyValue('padding-top'))
    const rootBorderTop = parseInt(computedStyle.getPropertyValue('border-top'))
    const topToRoot = verticalScrollEl instanceof HTMLElement ? viewEl.offsetTop - verticalScrollEl.offsetTop : 0
    const scrollTop =
      Math.floor(idx / resizeMeasurement.columns) * resizeMeasurement.itemHeightWithGap + topToRoot + rootPaddingTop + rootBorderTop
    verticalScrollEl.scrollTo({ top: scrollTop, behavior: 'smooth' })
  }

  watch(
    () => props.scrollTo,
    (val) => {
      if (val === undefined) {
        return
      }
      scrollToIdx(val)
    }
  )

  const { buffer, contentHeight, contentTranslate } = toRefs(state)
  return {
    contentHeight,
    contentTranslate,
    buffer,
    pageMode,
    scrollToIdx
  }
}
