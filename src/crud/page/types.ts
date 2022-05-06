export interface CompactButton {
  label: string
  icon: string
  disabled: boolean
  onClick: () => void
}

export interface GridPage {
  index: number
  total: number
}
