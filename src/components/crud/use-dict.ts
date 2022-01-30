import { dictValue } from '@/utils/dict'
import { AnyObject } from '@/utils'
import { upperFirst } from '@/utils/lang'
import { getDictListByName, IDictItem } from '@/api/system/dict-item'

export interface IDictList {
  [key: string]: IDictItem[]
}

export default function (dictOption?: IDictList) {
  // 获取字典数据
  const getDictData = async () => {
    const names = [] as string[]
    for (const key in dictOption) {
      names.push(upperFirst(key))
    }
    if (names.length > 0) {
      try {
        const data = await getDictListByName(names)
        setDicts(data)
      } catch (e) {
        console.log(e)
      }
    }
  }

  // 设置字典
  const setDicts = (resData: AnyObject) => {
    for (const key in dictOption) {
      dictOption[key] = resData[upperFirst(key)]
    }
  }

  // 字典key->value
  const dictVal = (dictItems: IDictItem[], key: string) => {
    if (!dictItems || dictItems.length === 0) {
      return
    }
    return dictValue(dictItems, key)
  }

  return {
    getDictData,
    dictVal
  }
}
