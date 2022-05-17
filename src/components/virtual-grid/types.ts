import { PropType } from 'vue'

export interface GridMeasurement {
  rowGap: number
  columns: number
}

export interface ResizeMeasurement {
  rowGap: number
  columns: number
  itemHeightWithGap: number
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
  localIndex: number
  value: unknown | undefined
}

export interface FdVirtualGridType {
  scrollToIdx: (idx: number, smooth?: boolean, offset?: number) => void
  scrollToPage: (pageNumber: number, smooth?: boolean, offset?: number) => void
  refresh: () => Promise<void>
  refreshBuffer: () => Promise<void>
}

export const DEBOUNCE_DEFAULT_TIME = 300

export const OFFSET_CHANGED_EVENT = 'offset-changed'
export const BUFFER_REFRESHED_EVENT = 'buffer-refreshed'

export const GRID_DEFAULT_PROPS = {
  // The number of items in the list.
  length: {
    type: Number,
    default: 0,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // Item width
  itemWidth: {
    type: Number,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // min-width used by grid-template-columns, ignored when itemWidth is set
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
  // initial index of item used by refresh and initialize
  initIndex: {
    type: Number,
    default: 0,
    validator: (value: number) => value >= 0
  },
  // set windowMode true, component is scrolled by window scroller
  windowMode: {
    type: Boolean,
    default: false
  },
  // delay of hiding loading mask
  loadingWait: {
    type: Number,
    default: 300
  },
  // distance subtracted when scrolling
  scrollOffset: {
    type: Number,
    default: 0
  },
  // enable or disable mobile mode
  mobileCompact: {
    type: Boolean,
    default: true
  }
}
