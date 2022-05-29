import { CodePreview } from '@b/api/generator/gen-table'

interface CodePreviewNode {
  id: number
  name: string
  path?: string
  lang?: string
  code?: CodePreview
  children?: CodePreviewNode[]
}

const LANG_OF_FILENAME = {
  java: 'text/x-java',
  vue: 'text/x-vue',
  xml: 'application/xml',
  sql: 'text/x-sql',
  ts: 'text/typescript'
} as Record<string, string>

const DEFAULT_QUERY_TYPES = [
  { label: '相等', value: 'EQUAL' },
  { label: '不等于', value: 'NOT_EQUAL' },
  { label: '大于', value: 'GREATER_THAN_NQ' },
  { label: '小于', value: 'LESS_THAN_NQ' },
  { label: '大于等于', value: 'GREATER_THAN' },
  { label: '小于等于', value: 'LESS_THAN' },
  { label: '中模糊查询', value: 'INNER_LIKE' },
  { label: '左模糊查询', value: 'LEFT_LIKE' },
  { label: '右模糊查询', value: 'RIGHT_LIKE' },
  { label: '包含', value: 'IN' },
  { label: '不为空', value: 'NOT_NULL' },
  { label: '范围', value: 'BETWEEN' }
]

const DEFAULT_HTML_TYPES = [
  { label: '文本框', value: 'input' },
  { label: '文本域', value: 'textarea' },
  { label: '下拉框（字典）', value: 'select' },
  { label: '单选框（字典）', value: 'radio' },
  { label: '复选框（字典或Boolean）', value: 'checkbox' },
  { label: '日期控件', value: 'datetime' },
  { label: '图片上传', value: 'image' },
  { label: '文件上传', value: 'upload' },
  { label: '富文本', value: 'editor' }
]

export { CodePreviewNode, LANG_OF_FILENAME, DEFAULT_HTML_TYPES, DEFAULT_QUERY_TYPES }
