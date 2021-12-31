import {ITreeNodeDefault} from "@/utils/data-tree";
import {ComputedRef, UnwrapNestedRefs} from "@vue/reactivity";

interface IRootMenuState {
  menuItems: ITreeNodeDefault[]
  activeId: string
  descActiveIds: string[]
  expandedIds: string[]
}

export interface IRootMenuProvided {
  levelPadding: ComputedRef<number>
  rootState: UnwrapNestedRefs<IRootMenuState>
  handleActive: (t: ITreeNodeDefault) => void
  handleExpand: (t: ITreeNodeDefault) => void
  handleCollapse: (t: ITreeNodeDefault) => void
}
