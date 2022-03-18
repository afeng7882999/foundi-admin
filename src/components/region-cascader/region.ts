// from https://github.com/Plortinus/element-china-area-data

import REGION_DATA from 'china-area-data'
import { cloneDeep } from 'lodash-es'
import { Indexable } from '@/common/types'

const regionData = REGION_DATA as Indexable
const provinceObject = regionData['86']

// code转汉字大对象
const codeToName = {} as Indexable
// 汉字转code大对象
const nameToCode = {} as Indexable
// 三级树状列表
const region3Array = [] as Indexable[]

codeToName[''] = '全部'

// 计算省
for (const prop in provinceObject) {
  region3Array.push({
    value: prop, // 省份code值
    label: provinceObject[prop] // 省份汉字
  })
  codeToName[prop] = provinceObject[prop]
  nameToCode[provinceObject[prop]] = {
    code: prop
  }
  nameToCode[provinceObject[prop]]['全部'] = {
    code: ''
  }
}
// 计算市
for (let i = 0, len = region3Array.length; i < len; i++) {
  const provinceCode = region3Array[i].value
  const provinceText = region3Array[i].label
  const provinceChildren = []
  for (const prop in regionData[provinceCode]) {
    provinceChildren.push({
      value: prop,
      label: regionData[provinceCode][prop]
    })
    codeToName[prop] = regionData[provinceCode][prop]
    nameToCode[provinceText][regionData[provinceCode][prop]] = {
      code: prop
    }
    nameToCode[provinceText][regionData[provinceCode][prop]]['全部'] = {
      code: ''
    }
  }
  if (provinceChildren.length) {
    region3Array[i].children = provinceChildren
  }
}
// 二级树状列表
const region2Array = cloneDeep(region3Array)

// 计算区
for (let i = 0, len = region3Array.length; i < len; i++) {
  const province = region3Array[i].children
  const provinceText = region3Array[i].label
  if (province) {
    for (let j = 0, len = province.length; j < len; j++) {
      const cityCode = province[j].value
      const cityText = province[j].label
      const cityChildren = []
      for (const prop in regionData[cityCode]) {
        cityChildren.push({
          value: prop,
          label: regionData[cityCode][prop]
        })
        codeToName[prop] = regionData[cityCode][prop]
        nameToCode[provinceText][cityText][regionData[cityCode][prop]] = {
          code: prop
        }
      }
      if (cityChildren.length) {
        province[j].children = cityChildren
      }
    }
  }
}

// 二级树状列表，节点添加“全部”选项
const region2ArrayPlus = cloneDeep(region2Array)
region2ArrayPlus.unshift({
  value: '',
  label: '全部'
})
for (let i = 0, len = region2ArrayPlus.length; i < len; i++) {
  const province = region2ArrayPlus[i].children
  if (province && province.length) {
    province.unshift({
      value: '',
      label: '全部'
    })

    for (let j = 0, len = province.length; j < len; j++) {
      const city = province[j].children
      if (city && city.length) {
        city.unshift({
          value: '',
          label: '全部'
        })
      }
    }
  }
}

// 三级树状列表，节点添加“全部”选项
const region3ArrayPlus = cloneDeep(region3Array)
region3ArrayPlus.unshift({
  value: '',
  label: '全部'
})
for (let i = 0, len = region3ArrayPlus.length; i < len; i++) {
  const province = region3ArrayPlus[i].children
  if (province && province.length) {
    province.unshift({
      value: '',
      label: '全部'
    })

    for (let j = 0, len = province.length; j < len; j++) {
      const city = province[j].children
      if (city && city.length) {
        city.unshift({
          value: '',
          label: '全部'
        })
      }
    }
  }
}
export { region2Array, region3Array, region2ArrayPlus, region3ArrayPlus, codeToName, nameToCode }
