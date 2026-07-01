import { MONTH_COUNT, type BudgetData, type Department, type LineItem } from './types'

const STORAGE_KEY = 'dept-budget-app:v1'

function zeros(): number[] {
  return Array.from({ length: MONTH_COUNT }, () => 0)
}

let idCounter = 0
export function makeId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
}

export function createLineItem(category: string): LineItem {
  return { id: makeId('item'), category, budget: zeros(), actual: zeros() }
}

export function createDepartment(name: string): Department {
  return { id: makeId('dept'), name, items: [] }
}

function seedData(): BudgetData {
  const sales = createDepartment('営業部')
  sales.items = [
    { ...createLineItem('人件費'), budget: [1200000, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000], actual: [1180000, 1195000, 1210000, 1200000, 1200000, 1205000, 0, 0, 0, 0, 0, 0] },
    { ...createLineItem('旅費交通費'), budget: [80000, 80000, 80000, 80000, 90000, 90000, 90000, 90000, 80000, 80000, 80000, 80000], actual: [75000, 82000, 78000, 81000, 88000, 91000, 0, 0, 0, 0, 0, 0] },
    { ...createLineItem('広告宣伝費'), budget: [200000, 200000, 300000, 300000, 200000, 200000, 200000, 200000, 300000, 300000, 200000, 200000], actual: [195000, 210000, 305000, 290000, 198000, 205000, 0, 0, 0, 0, 0, 0] },
  ]

  const dev = createDepartment('開発部')
  dev.items = [
    { ...createLineItem('人件費'), budget: [1500000, 1500000, 1500000, 1500000, 1500000, 1500000, 1500000, 1500000, 1500000, 1500000, 1500000, 1500000], actual: [1500000, 1500000, 1520000, 1500000, 1500000, 1510000, 0, 0, 0, 0, 0, 0] },
    { ...createLineItem('ソフトウェア費'), budget: [100000, 50000, 50000, 50000, 150000, 50000, 50000, 50000, 50000, 150000, 50000, 50000], actual: [98000, 52000, 47000, 55000, 148000, 51000, 0, 0, 0, 0, 0, 0] },
    { ...createLineItem('消耗品費'), budget: [30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000], actual: [28000, 31000, 29500, 30500, 29000, 32000, 0, 0, 0, 0, 0, 0] },
  ]

  const admin = createDepartment('総務部')
  admin.items = [
    { ...createLineItem('人件費'), budget: [900000, 900000, 900000, 900000, 900000, 900000, 900000, 900000, 900000, 900000, 900000, 900000], actual: [900000, 900000, 900000, 900000, 900000, 900000, 0, 0, 0, 0, 0, 0] },
    { ...createLineItem('賃借料'), budget: [250000, 250000, 250000, 250000, 250000, 250000, 250000, 250000, 250000, 250000, 250000, 250000], actual: [250000, 250000, 250000, 250000, 250000, 250000, 0, 0, 0, 0, 0, 0] },
  ]

  return {
    fiscalYear: new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1,
    departments: [sales, dev, admin],
  }
}

export function loadData(): BudgetData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedData()
    const parsed = JSON.parse(raw) as BudgetData
    if (!parsed.departments || !Array.isArray(parsed.departments)) return seedData()
    return parsed
  } catch {
    return seedData()
  }
}

export function saveData(data: BudgetData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
