import { ElLoadingService as Loading } from 'element-plus/es/components/loading'
import { Indexable } from '@/types/global'

export const INSTANCE_KEY = Symbol('ElLoading')

export interface ElementLoading extends HTMLElement {
  [INSTANCE_KEY]?: {
    instance: ReturnType<typeof Loading>
    options: Indexable
  }
}

export const DEFAULT_LOADING_OPT = {
  text: '',
  spinner: '<use xlink:href="#svg-graphics-spinner"></use>',
  svgViewBox: '0 0 52 12'
}
