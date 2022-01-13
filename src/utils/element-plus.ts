import { ElTree } from 'element-plus'
import { getCurrentAndDesc } from '@/utils/data-tree'

const useElTree = () => {
  /**
   * 清除ElTree
   */
  const clear = (com: typeof ElTree): void => {
    if (com) {
      const store = com.store as any
      store.root.childNodes.splice(0, store.root.childNodes.length)
    }
  }

  /**
   * 初始化ElTree
   */
  const init = (com: typeof ElTree, initData: any[]): void => {
    if (com) {
      const store = com.store as any
      store.root.doCreateChildren(initData)
    }
  }

  /**
   * 选择当前项与下级
   */
  const checkCurrentAndDesc = (com: typeof ElTree, data: any[]): number => {
    const current = com.getCurrentKey()
    let checked = com.getCheckedKeys()
    if (current) {
      const desc = getCurrentAndDesc(data, (m) => m.id === current)?.map((m) => m.id)
      checked = [...new Set(checked.concat(desc))]
      com.setCheckedKeys(checked, true)
    }
    return checked.length
  }

  /**
   * 清除当前项与下级
   */
  const uncheckCurrentAndDesc = (com: typeof ElTree, data: any[]): number => {
    const current = com.getCurrentKey()
    let checked = com.getCheckedKeys()
    if (current) {
      const desc = getCurrentAndDesc(data, (m) => m.id === current)?.map((m) => m.id)
      checked = checked.filter((c: string) => !desc?.includes(c))
      com.setCheckedKeys(checked, true)
    }
    return checked.length
  }

  /**
   * 全部节点展开
   * @param com
   */
  const expandAll = (com: typeof ElTree) => {
    const nodes = (com.store as any).nodesMap
    for (const i in nodes) {
      nodes[i].expanded = true
    }
  }

  /**
   * 全部节点收缩
   * @param com
   */
  const collapseAll = (com: typeof ElTree) => {
    const nodes = (com.store as any).nodesMap
    for (const i in nodes) {
      nodes[i].expanded = false
    }
  }

  return {
    clear,
    init,
    checkCurrentAndDesc,
    uncheckCurrentAndDesc,
    expandAll,
    collapseAll
  }
}

export { useElTree }
