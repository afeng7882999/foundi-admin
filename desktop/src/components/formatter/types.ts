import { PropType } from 'vue'

export interface FormatMappingItem {
  key: string
  val?: string
  color?: string
}

export type FormatMapping = FormatMappingItem[]

export const FORMATTER_DEFAULT_PROPS = {
  data: [String, Number, Array] as PropType<string | number | string[] | number[]>,
  mapping: [String, Array] as PropType<string[] | FormatMapping>
}
