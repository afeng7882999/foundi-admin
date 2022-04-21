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
  style?: { transform: string; gridArea: string }
}

export const GRID_PROPS = {
  // The number of items in the list.
  length: {
    type: Number as PropType<number>,
    required: true,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // Item width
  itemWidth: {
    type: Number as PropType<number>,
    required: true,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // Item height
  itemHeight: {
    type: Number as PropType<number>,
    required: true,
    validator: (value: number) => Number.isInteger(value) && value >= 0
  },
  // The callback that returns a page of items as a promise.
  pageProvider: {
    type: Function as PropType<PageProvider>,
    required: true
  },
  // The number of items in a page from the item provider
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
  },
  // The css class of wrapper container
  wrapperClass: {
    type: String
  }
}
