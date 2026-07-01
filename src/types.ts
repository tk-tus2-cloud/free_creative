export const MONTH_LABELS = [
  '4月', '5月', '6月', '7月', '8月', '9月',
  '10月', '11月', '12月', '1月', '2月', '3月',
] as const

export const MONTH_COUNT = MONTH_LABELS.length

export interface LineItem {
  id: string
  category: string
  budget: number[] // length MONTH_COUNT, 予算
  actual: number[] // length MONTH_COUNT, 実績
}

export interface Department {
  id: string
  name: string
  items: LineItem[]
}

export interface BudgetData {
  fiscalYear: number
  departments: Department[]
}

export type ViewMode = 'budget' | 'actual' | 'diff' | 'rate'
