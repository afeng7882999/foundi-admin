import { AnyObject } from '@/utils/index'
import { cloneDeep } from 'lodash-es'

export interface ITreeNode {
  [key: string]: any
}

// 默认树状节点
export interface ITreeNodeDefault extends ITreeNode {
  id: string
  parentId: string
  parentPath: string
  sort: number
  level: number
  children: ITreeNodeDefault[]

  [key: string]: any
}

// 树状节点属性名称
export interface ITreeFields {
  idField?: string
  parentIdField?: string
  parentPathField?: string
  sortField?: string
  levelField?: string
  childrenField?: string

  [key: string]: any
}

// 树状节点默认属性名称
export const DEFAULT_TREE_FIELDS: ITreeFields = {
  idField: 'id',
  parentIdField: 'parentId',
  parentPathField: 'parentPath',
  sortField: 'sort',
  levelField: 'level',
  childrenField: 'children'
}

/**
 * 树排序
 */
function sortTree<T extends ITreeNode>(treeNodes: T[], opt = DEFAULT_TREE_FIELDS) {
  const { sortField, childrenField } = opt
  treeNodes.sort((a, b) => a[sortField as string] - b[sortField as string])
  treeNodes.map((item) => {
    if (item[childrenField as string] && item[childrenField as string].length > 0) {
      sortTree(item[childrenField as string], opt)
    }
  })
}

/**
 * 是否是树状数据
 */
export function isTreeData(nodes: AnyObject[], opt = DEFAULT_TREE_FIELDS) {
  const { childrenField } = opt
  return nodes && nodes[0].hasOwnProperty(childrenField as string)
}

/**
 * 列表结构转树结构
 */
export function arrayToTree<T extends ITreeNode>(treeNodes: T[], opt = DEFAULT_TREE_FIELDS): T[] {
  const { idField, childrenField, parentIdField } = opt
  const map = {} as AnyObject
  const arrayOfTree = [] as T[]
  for (let i = 0; i < treeNodes.length; i += 1) {
    const k = treeNodes[i][idField as string] as string
    map[k] = i
    ;(treeNodes[i] as AnyObject)[childrenField as string] = []
  }
  for (let i = 0; i < treeNodes.length; i += 1) {
    const node = treeNodes[i]
    if (map.hasOwnProperty(node[parentIdField as string])) {
      const parent = treeNodes[map[node[parentIdField as string]]]
      if (parent[childrenField as string]) {
        parent[childrenField as string].push(node)
      }
    } else {
      arrayOfTree.push(node)
    }
  }
  sortTree(arrayOfTree, opt)
  return arrayOfTree
}

/**
 * 遍历树
 */
export function traverseTree<T extends ITreeNode>(treeNodes: T[], arranger: (node: T) => void, opt = DEFAULT_TREE_FIELDS): T[] {
  const { childrenField } = opt
  let stack: T[] = []
  stack = stack.concat(treeNodes)
  while (stack.length > 0) {
    const tmpNode = stack.shift() as T
    if (tmpNode) {
      arranger(tmpNode)
      if (tmpNode[childrenField as string] && tmpNode[childrenField as string].length > 0) {
        stack = tmpNode[childrenField as string].concat(stack)
      }
    }
  }
  return treeNodes
}

/**
 * 设置兄弟节点
 */
export function setSiblings<T extends ITreeNode>(treeNodes: T[], parent: T, props: AnyObject, opt = DEFAULT_TREE_FIELDS): void {
  const { parentIdField } = opt
  traverseTree<T>(
    treeNodes,
    (item) => {
      if (item[parentIdField as string] === parent[parentIdField as string]) {
        Object.assign(item, props)
      }
    },
    opt
  )
}

/**
 * 树筛选
 * 父节点不满足条件即不遍历子节点
 */
export function filterTree<T extends ITreeNode>(treeNodes: T[], matcher: (node: T) => boolean, opt = DEFAULT_TREE_FIELDS): T[] {
  const { childrenField } = opt
  const result = [] as T[]
  for (const root of treeNodes) {
    if (matcher(root)) {
      const copy = cloneDeep(root)
      const finish = traverseTree<T>(
        [copy],
        (item) => {
          const children = item[childrenField as string] as T[]
          if (children && children.length > 0) {
            ;(item as any)[childrenField as string] = children.filter((c: T) => matcher(c))
          }
        },
        opt
      )
      result.push(...finish)
    }
  }
  return result
}

/**
 * 获取多个树节点
 */
export function getTreeNodes<T extends ITreeNode>(treeNodes: T[], matcher: (node: T) => boolean, opt = DEFAULT_TREE_FIELDS): T[] {
  const { childrenField } = opt
  let stack: T[] = []
  const result = []
  stack = stack.concat(treeNodes)
  while (stack.length > 0) {
    const tmpNode = stack.shift() as T
    if (tmpNode && matcher(tmpNode)) {
      result.push(tmpNode)
    }
    if (tmpNode && tmpNode[childrenField as string] && tmpNode[childrenField as string].length > 0) {
      stack = tmpNode[childrenField as string].concat(stack)
    }
  }
  return result
}

/**
 * 获取一个树节点
 */
export function getTreeNode<T extends ITreeNode>(treeNodes: T[], matcher: (node: T) => boolean, opt = DEFAULT_TREE_FIELDS): T | null {
  const { childrenField } = opt
  let stack: T[] = []
  stack = stack.concat(treeNodes)
  while (stack.length > 0) {
    const tmpNode = stack.shift() as T
    if (tmpNode && matcher(tmpNode)) {
      return tmpNode
    }
    if (tmpNode && tmpNode[childrenField as string] && tmpNode[childrenField as string].length > 0) {
      stack = tmpNode[childrenField as string].concat(stack)
    }
  }
  return null
}

/**
 * 获取父节点
 */
export function getParent<T extends ITreeNode>(treeNodes: T[], ITreeNode: T, opt = DEFAULT_TREE_FIELDS): T | null {
  const { idField, parentIdField } = opt
  return getTreeNode<T>(treeNodes, (item) => item[idField as string] === ITreeNode[parentIdField as string], opt)
}

/**
 * 获取本级与下级节点列表
 */
export function getCurrentAndDesc<T extends ITreeNode>(
  treeNodes: T[],
  parentMatcher: (node: T) => boolean,
  opt = DEFAULT_TREE_FIELDS
): T[] | null {
  const parent = getTreeNode(treeNodes, (item) => parentMatcher(item))
  if (parent) {
    return getTreeNodes([parent], () => true, opt)
  }
  return null
}
