import { ICodePreview } from '@/api/generator/gen-table'

interface ICodePreviewNode {
  id: number
  name: string
  expanded?: boolean
  selected?: boolean
  lang?: string
  code?: ICodePreview
  children?: ICodePreviewNode[]
}

const LANG_OF_FILENAME = {
  java: 'text/x-java',
  vue: 'text/x-vue',
  xml: 'application/xml',
  sql: 'text/x-sql',
  ts: 'text/typescript'
} as Record<string, string>

export { ICodePreviewNode, LANG_OF_FILENAME }
