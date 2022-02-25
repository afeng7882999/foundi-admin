import { TreeNodeDefault } from '@/utils/data-tree'
import { ComputedRef, UnwrapNestedRefs } from '@vue/reactivity'

interface RootMenuState {
  menuItems: TreeNodeDefault[]
  activeId: string
  descActiveIds: string[]
  expandedIds: string[]
}

export interface RootMenuProvided {
  levelPadding: ComputedRef<number>
  rootState: UnwrapNestedRefs<RootMenuState>
  handleActive: (t: TreeNodeDefault) => void
  handleExpand: (t: TreeNodeDefault) => void
  handleCollapse: (t: TreeNodeDefault) => void
}
