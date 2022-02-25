import { dictValue } from '@/utils/dict'
import { upperFirst } from '@/utils/lang'
import { getDictListByName, DictItem, DictList } from '@/api/system/dict-item'

export default function (dictOption?: DictList) {
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
  const setDicts = (resData: DictList) => {
    for (const key in dictOption) {
      dictOption[key] = resData[upperFirst(key)]
    }
  }

  // 字典key->value
  const dictVal = (dictItems: DictItem[], key: string) => {
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
