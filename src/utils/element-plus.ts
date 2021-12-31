import { ElTree } from 'element-plus'

/**
 * 清除ElTree
 */
export function elTreeClear(com: typeof ElTree): void {
  if (com) {
    const store = com.store as any
    store.root.childNodes.splice(0, store.root.childNodes.length)
  }
}

/**
 * 初始化ElTree
 */
export function elTreeInit(com: typeof ElTree, initData: any[]): void {
  if (com) {
    const store = com.store as any
    store.root.doCreateChildren(initData)
  }
}
