import { IDictItem } from '@/api/system/dict-item'

/**
 * 由键值查找字典值
 */
export function dictValue(dictItems: IDictItem[], key: string): string {
  const result = dictItems.find((d) => d.itemKey === key)
  if (result && result.itemValue) {
    return result.itemValue
  } else {
    return key
  }
}

/**
 * 由字典值查找键值
 */
export function dictKey(dictItems: IDictItem[], value: string): string {
  const result = dictItems.find((d) => d.itemValue === value)
  if (result && result.itemKey) {
    return result.itemKey
  } else {
    return value
  }
}
