import { useMemo, useState } from 'react'
import { MONTH_COUNT, MONTH_LABELS, type Department, type ViewMode } from '../types'
import { formatRate, formatYen, downloadCsv } from '../utils/format'

interface Props {
  department: Department
  fiscalYear: number
  onAddCategory: (name: string) => void
  onRenameCategory: (itemId: string, name: string) => void
  onDeleteCategory: (itemId: string) => void
  onChangeValue: (itemId: string, monthIndex: number, mode: 'budget' | 'actual', value: number) => void
}

const VIEW_LABELS: Record<ViewMode, string> = {
  budget: '予算入力',
  actual: '実績入力',
  diff: '差額（予算-実績）',
  rate: '執行率',
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0)
}

export default function BudgetTable({
  department,
  fiscalYear,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onChangeValue,
}: Props) {
  const [mode, setMode] = useState<ViewMode>('budget')
  const [newCategory, setNewCategory] = useState('')

  const monthlyTotals = useMemo(() => {
    const budgetTotals = Array.from({ length: MONTH_COUNT }, () => 0)
    const actualTotals = Array.from({ length: MONTH_COUNT }, () => 0)
    for (const item of department.items) {
      for (let m = 0; m < MONTH_COUNT; m++) {
        budgetTotals[m] += item.budget[m]
        actualTotals[m] += item.actual[m]
      }
    }
    return { budgetTotals, actualTotals }
  }, [department])

  const grandBudget = sum(monthlyTotals.budgetTotals)
  const grandActual = sum(monthlyTotals.actualTotals)

  function cellValue(itemBudget: number[], itemActual: number[], m: number): string {
    const b = itemBudget[m]
    const a = itemActual[m]
    switch (mode) {
      case 'budget':
        return b.toString()
      case 'actual':
        return a.toString()
      case 'diff':
        return formatYen(b - a)
      case 'rate':
        return formatRate(b === 0 ? (a === 0 ? 0 : null) : (a / b) * 100)
    }
  }

  function handleExportCsv() {
    const header = ['費目', ...MONTH_LABELS, '合計']
    const rows: (string | number)[][] = [header]
    for (const item of department.items) {
      const budgetTotal = sum(item.budget)
      rows.push(['予算', ...item.budget, budgetTotal].map((v, i) => (i === 0 ? `${item.category}（予算）` : v)))
      const actualTotal = sum(item.actual)
      rows.push(['実績', ...item.actual, actualTotal].map((v, i) => (i === 0 ? `${item.category}（実績）` : v)))
    }
    rows.push(['予算合計', ...monthlyTotals.budgetTotals, grandBudget])
    rows.push(['実績合計', ...monthlyTotals.actualTotals, grandActual])
    downloadCsv(`${department.name}_${fiscalYear}年度_予算実績.csv`, rows)
  }

  return (
    <div className="budget-table-wrap">
      <div className="table-toolbar">
        <div className="view-mode-tabs">
          {(Object.keys(VIEW_LABELS) as ViewMode[]).map((m) => (
            <button
              key={m}
              className={m === mode ? 'active' : ''}
              onClick={() => setMode(m)}
              type="button"
            >
              {VIEW_LABELS[m]}
            </button>
          ))}
        </div>
        <button type="button" className="secondary" onClick={handleExportCsv}>
          CSV出力
        </button>
      </div>

      <div className="table-scroll">
        <table className="budget-table">
          <thead>
            <tr>
              <th className="sticky-col">費目</th>
              {MONTH_LABELS.map((label) => (
                <th key={label}>{label}</th>
              ))}
              <th>合計</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {department.items.map((item) => {
              const total = mode === 'budget' ? sum(item.budget) : mode === 'actual' ? sum(item.actual) : null
              return (
                <tr key={item.id}>
                  <td className="sticky-col">
                    <input
                      className="category-input"
                      value={item.category}
                      onChange={(e) => onRenameCategory(item.id, e.target.value)}
                    />
                  </td>
                  {MONTH_LABELS.map((_, m) => (
                    <td key={m}>
                      {mode === 'budget' || mode === 'actual' ? (
                        <input
                          type="number"
                          className="cell-input"
                          value={mode === 'budget' ? item.budget[m] : item.actual[m]}
                          onChange={(e) => onChangeValue(item.id, m, mode, Number(e.target.value) || 0)}
                        />
                      ) : (
                        <span className="cell-readonly">{cellValue(item.budget, item.actual, m)}</span>
                      )}
                    </td>
                  ))}
                  <td className="col-total">
                    {total !== null
                      ? formatYen(total)
                      : mode === 'diff'
                        ? formatYen(sum(item.budget) - sum(item.actual))
                        : formatRate(sum(item.budget) === 0 ? null : (sum(item.actual) / sum(item.budget)) * 100)}
                  </td>
                  <td className="col-actions">
                    <button type="button" className="icon-btn danger" onClick={() => onDeleteCategory(item.id)} title="削除">
                      ✕
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="sticky-col">合計</td>
              {MONTH_LABELS.map((_, m) => {
                const b = monthlyTotals.budgetTotals[m]
                const a = monthlyTotals.actualTotals[m]
                let display: string
                if (mode === 'budget') display = formatYen(b)
                else if (mode === 'actual') display = formatYen(a)
                else if (mode === 'diff') display = formatYen(b - a)
                else display = formatRate(b === 0 ? null : (a / b) * 100)
                return <td key={m}>{display}</td>
              })}
              <td className="col-total">
                {mode === 'budget'
                  ? formatYen(grandBudget)
                  : mode === 'actual'
                    ? formatYen(grandActual)
                    : mode === 'diff'
                      ? formatYen(grandBudget - grandActual)
                      : formatRate(grandBudget === 0 ? null : (grandActual / grandBudget) * 100)}
              </td>
              <td className="col-actions"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <form
        className="add-category-form"
        onSubmit={(e) => {
          e.preventDefault()
          const trimmed = newCategory.trim()
          if (!trimmed) return
          onAddCategory(trimmed)
          setNewCategory('')
        }}
      >
        <input
          placeholder="新しい費目名（例：会議費）"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button type="submit">費目を追加</button>
      </form>
    </div>
  )
}
