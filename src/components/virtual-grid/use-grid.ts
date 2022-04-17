import { concat, differenceWith, isEqual, range, slice, without, zip } from 'lodash-es'
import {ExtractPropTypes, nextTick, onMounted, reactive, ref, toRefs, watch} from 'vue'
import {
  BufferMeta,
  GRID_PROPS,
  GridMeasurement,
  InternalItem,
  ItemsByPage,
  PageProvider,
  ResizeMeasurement
} from '@/components/virtual-grid/types'
import { useEventListener, useResizeObserver, useThrottleFn, VueInstance } from '@vueuse/core'
import { Ref } from '@vue/reactivity'
import {nextFrame} from "@/utils/next-frame";

const computeHeightAboveWindowOf = (el: Element): number => {
  const top = el.getBoundingClientRect().top
  return Math.abs(Math.min(top, 0))
}

const getGridMeasurement = (rootEl: Element): GridMeasurement => {
  const computedStyle = window.getComputedStyle(rootEl)

  return {
    rowGap: parseInt(computedStyle.getPropertyValue('row-gap')) || 0,
    colGap: parseInt(computedStyle.getPropertyValue('column-gap')) || 0,
    columns: computedStyle.getPropertyValue('grid-template-columns').split(' ').length
  }
}

const getResizeMeasurement = (rootEl: Element, { height, width }: DOMRectReadOnly): ResizeMeasurement => {
  const { rowGap, colGap, columns } = getGridMeasurement(rootEl)
  return {
    rowGap,
    columns,
    itemHeightWithGap: height + rowGap,
    itemWidthWithGap: width + colGap
  }
}

const getBufferMeta =
  (windowInnerHeight: number = window.innerHeight) =>
  (heightAboveWindow: number, { columns, rowGap, itemHeightWithGap }: ResizeMeasurement): BufferMeta => {
    const rowsInView = itemHeightWithGap && Math.ceil((windowInnerHeight + rowGap) / itemHeightWithGap) + 1
    const length = rowsInView * columns

    const rowsBeforeView = itemHeightWithGap && Math.floor((heightAboveWindow + rowGap) / itemHeightWithGap)
    const offset = rowsBeforeView * columns
    const bufferedOffset = Math.max(offset - Math.floor(length / 2), 0)
    const bufferedLength = length * 2

    return {
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
  console.warn('provider')
  const itemsByPages = [] as ItemsByPage[]
  for (const pageNumber of pageNumbers) {
    const items = await pageProvider(pageNumber, pageSize)
    itemsByPages.push({
      pageNumber,
      items
    })
  }
  return itemsByPages
}

const accumulateAllItems = (allItems: unknown[], [{ pageNumber, items }, length, pageSize]: [ItemsByPage, number, number]): unknown[] => {
  const allItemsFill = new Array(Math.max(length - allItems.length, 0)).fill(undefined)
  const pageFill = new Array(Math.max(pageSize - items.length, 0)).fill(undefined)
  const normalizedItems = concat(slice(items, 0, pageSize), pageFill)
  const filled = concat(allItems, allItemsFill)
  filled.splice(pageNumber * pageSize, pageSize, ...normalizedItems)
  return slice(filled, 0, length)
}

const getVisibleItems = (
  { bufferedOffset, bufferedLength }: BufferMeta,
  { columns, itemWidthWithGap, itemHeightWithGap }: ResizeMeasurement,
  allItems: unknown[]
): InternalItem[] => {
  const visibleItems = slice(allItems, bufferedOffset, bufferedOffset + bufferedLength)
  return visibleItems.map((value, localIndex) => {
    const index = bufferedOffset + localIndex
    const x = (index % columns) * itemWidthWithGap
    const y = Math.floor(index / columns) * itemHeightWithGap
    return {
      index,
      value,
      style: {
        gridArea: '1/1',
        transform: `translate(${x}px, ${y}px)`
      }
    }
  })
}

const accumulateBuffer = (buffer: InternalItem[], visibleItems: InternalItem[], { bufferedLength }: BufferMeta): InternalItem[] => {
  const itemsToAdd = differenceWith(visibleItems, buffer, isEqual)
  const itemsFreeToUse = differenceWith(buffer, visibleItems, isEqual)

  if (itemsFreeToUse.length) {
    const replaceMap = new Map(zip(itemsFreeToUse, itemsToAdd) as Array<[InternalItem, InternalItem]>)
    const itemsToBeReplaced = [...replaceMap.keys()]
    const itemsToReplaceWith = [...replaceMap.values()]

    const itemsToDelete = differenceWith(itemsFreeToUse, itemsToBeReplaced, isEqual)
    const itemsToAppend = differenceWith(itemsToAdd, itemsToReplaceWith, isEqual)

    const itemsLeft = without(buffer, ...itemsToDelete).map((item) => replaceMap.get(item) ?? item)
    return concat(itemsLeft, itemsToAppend).slice(0, bufferedLength)
  }

  return visibleItems
}

const getContentHeight = ({ columns, rowGap, itemHeightWithGap }: ResizeMeasurement, length: number): number => {
  return itemHeightWithGap * Math.ceil(length / columns) - rowGap
}

const getVerticalScrollParent = (element: Element, includeHidden = false): Element => {
  const style = getComputedStyle(element)
  const excludeStaticParent = style.position === 'absolute'
  const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/
  if (style.position === 'fixed') {
    return document.body
  }
  for (let parent: Element | null = element; (parent = parent.parentElement); ) {
    const parentStyle = getComputedStyle(parent)
    if (excludeStaticParent && parentStyle.position === 'static') {
      continue
    }
    if (overflowRegex.test(parentStyle.overflow + parentStyle.overflowY)) return parent
  }
  return document.scrollingElement || document.documentElement
}

export default function useGrid(
  props: Readonly<ExtractPropTypes<typeof GRID_PROPS>>,
  rootRef: Ref<HTMLElement | SVGElement | VueInstance | undefined>,
  probeRef: Ref<HTMLElement | SVGElement | VueInstance | undefined>
) {
  let heightAboveWindow = 0
  let resizeMeasurement = {} as ResizeMeasurement
  let itemRect = {} as DOMRect
  let bufferMeta = {} as BufferMeta
  let visiblePageNumbers = [] as number[]
  let allItems = [] as unknown[]
  const contentHeight = ref(0)
  const state = reactive({
    buffer: [] as InternalItem[]
  })

  useResizeObserver(rootRef, async (entries) => {
    console.log('root')
    heightAboveWindow = computeHeightAboveWindowOf(entries[0].target)
    resizeMeasurement = getResizeMeasurement(rootRef.value as HTMLElement, itemRect)
    contentHeight.value = getContentHeight(resizeMeasurement, props.length as number)
    await getBufferThrottle()
  })

  useResizeObserver(probeRef, async (entries) => {
    console.log('probe')
    itemRect = entries[0].contentRect
    resizeMeasurement = getResizeMeasurement(rootRef.value as HTMLElement, itemRect)
    contentHeight.value = getContentHeight(resizeMeasurement, props.length as number)
    await getBufferThrottle()
  })

  useEventListener(
    'scroll',
    async () => {
      heightAboveWindow = computeHeightAboveWindowOf(rootRef.value as HTMLElement)
      await getBufferThrottle()
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
      contentHeight.value = getContentHeight(resizeMeasurement, val)
    }
  )

  const scrollToIdx = (idx: number): void => {
    idx = Math.max(idx, 0)
    const rootEl = rootRef.value as HTMLElement
    const verticalScrollEl = getVerticalScrollParent(rootEl)
    const computedStyle = window.getComputedStyle(rootEl)
    const gridPaddingTop = parseInt(computedStyle.getPropertyValue('padding-top'))
    const gridBoarderTop = parseInt(computedStyle.getPropertyValue('border-top'))
    const topToGridContainer = verticalScrollEl instanceof HTMLElement ? rootEl.offsetTop - verticalScrollEl.offsetTop : 0
    const scrollTop =
      Math.floor(idx / resizeMeasurement.columns) * resizeMeasurement.itemHeightWithGap +
      topToGridContainer +
      gridPaddingTop +
      gridBoarderTop
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

  const getBuffer = async (): Promise<void> => {
    console.log('buffer>>>>>>>>>>>>>>>>>>')
    if (!props.pageProvider) {
      return
    }
    bufferMeta = getBufferMeta()(heightAboveWindow, resizeMeasurement)
    const visiblePn = getVisiblePageNumbers(bufferMeta, props.length as number, props.pageSize as number)
    if (!isEqual(visiblePageNumbers, visiblePn)) {
      visiblePageNumbers = visiblePn
      const itemByPages = await callPageProvider(visiblePageNumbers, props.pageSize as number, props.pageProvider)
      for (const itemByPage of itemByPages) {
        allItems = accumulateAllItems(allItems, [itemByPage, props.length as number, props.pageSize as number])
      }
    }
    const visibleItems = getVisibleItems(bufferMeta, resizeMeasurement, allItems)
    state.buffer = accumulateBuffer(state.buffer, visibleItems, bufferMeta)
  }

  const getBufferThrottle = useThrottleFn(getBuffer, props.pageProviderThrottleTime as number)

  const { buffer } = toRefs(state)
  return {
    contentHeight,
    buffer,
    scrollToIdx
  }
}
