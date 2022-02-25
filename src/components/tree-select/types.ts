import { TreeFields } from '@/utils/data-tree'

export const DEFAULT_SELECT_PARAMS = {
  multiple: false,
  clearable: true,
  disabled: false,
  expandOnClickNode: false,
  placeholder: '空'
}
export const DEFAULT_TREE_PARAMS = {
  clickParent: true,
  filterable: false,
  defaultExpandAll: true,
  props: {
    children: 'children',
    label: 'name',
    disabled: 'disabled'
  }
}
export const DEFAULT_TREE_FIELDS: TreeFields = {
  idField: 'id',
  labelField: 'name',
  parentIdField: 'parentId',
  sortField: 'sort',
  childrenField: 'children',
  disabledField: 'disabled'
}
