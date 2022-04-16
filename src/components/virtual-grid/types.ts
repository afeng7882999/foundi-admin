import { PropType } from 'vue'

export interface GridMeasurement {
  colGap: number
  rowGap: number
  columns: number
}

export interface ResizeMeasurement {
  rowGap: number
  columns: number
  itemHeightWithGap: number
  itemWidthWithGap: number
}

export interface BufferMeta {
  bufferedOffset: number
  bufferedLength: number
}

export interface ItemsByPage {
  pageNumber: number
  items: unknown[]
}

export type PageProvider = (pageNumber: number, pageSize: number) => Promise<unknown[]>

export interface InternalItem {
  index: number
  value: unknown | undefined
  style?: { transform: string; gridArea: string }
}

export type ScrollAction = [Element, number]

export const GRID_PROPS = {
  // The number of items in the list.
  length: {
    type: Number as PropType<number>,
    required: true,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // The callback that returns a page of items as a promise.
  pageProvider: {
    type: Function as PropType<PageProvider>,
    required: true
  },
  // Debounce window in milliseconds on the calls to `pageProvider`,
  // which is useful for avoiding network requests of skimmed pages.
  pageProviderThrottleTime: {
    type: Number as PropType<number>,
    default: 300,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // The number of items in a page from the item provider (e.g. a backend API).
  pageSize: {
    type: Number as PropType<number>,
    required: true,
    validator: (value: number) => Number.isInteger(value) && value >= 1
  },
  // Scroll to a specific item by index, must be less than the length prop
  scrollTo: {
    type: Number as PropType<number>,
    required: false,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  }
}
