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
  columns: number
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
}

export const GRID_PROPS = {
  // The number of items in the list.
  length: {
    type: Number,
    default: 0,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // wrapper width
  wrapperWidth: {
    type: Number,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // wrapper height
  wrapperHeight: {
    type: Number,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // Item width
  itemWidth: {
    type: Number,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // Item min-width, ignored when itemWidth is set
  itemMinWidth: {
    type: Number,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // Item height
  itemHeight: {
    type: Number,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // Grid gap
  gridGap: {
    type: Number,
    default: 8,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // The callback that returns a page of items as a promise.
  pageProvider: {
    type: Function as PropType<PageProvider>,
    required: true
  },
  // Debounce window in milliseconds on the calls to `pageProvider`,
  // which is useful for avoiding network requests of skimmed pages.
  pageProviderDebounceTime: {
    type: Number,
    default: 300,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // The number of items in a page from the item provider
  pageSize: {
    type: Number,
    default: 40,
    validator: (value: number) => Number.isInteger(value) && value >= 1
  },
  // Scroll to a specific item by index, must be less than the length prop
  scrollTo: {
    type: Number,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  }
}
