import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Department } from '../types'
import { formatRate, formatYen, downloadCsv } from '../utils/format'

interface Props {
  departments: Department[]
  fiscalYear: number
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0)
}

export default function SummaryDashboard({ departments, fiscalYear }: Props) {
  const rows = useMemo(
    () =>
      departments.map((dept) => {
        const budget = sum(dept.items.flatMap((i) => i.budget))
        const actual = sum(dept.items.flatMap((i) => i.actual))
        return {
          id: dept.id,
          name: dept.name,
          budget,
          actual,
          diff: budget - actual,
          rate: budget === 0 ? null : (actual / budget) * 100,
        }
      }),
    [departments],
  )

  const grandBudget = sum(rows.map((r) => r.budget))
  const grandActual = sum(rows.map((r) => r.actual))

  function handleExportCsv() {
    const header = ['部門', '予算', '実績', '差額', '執行率(%)']
    const body = rows.map((r) => [r.name, r.budget, r.actual, r.diff, r.rate === null ? '' : r.rate.toFixed(1)])
    const footer = ['合計', grandBudget, grandActual, grandBudget - grandActual, grandBudget === 0 ? '' : ((grandActual / grandBudget) * 100).toFixed(1)]
    downloadCsv(`${fiscalYear}年度_部門別サマリー.csv`, [header, ...body, footer])
  }

  return (
    <div className="summary-dashboard">
      <div className="table-toolbar">
        <h2>{fiscalYear}年度 部門別サマリー</h2>
        <button type="button" className="secondary" onClick={handleExportCsv}>
          CSV出力
        </button>
      </div>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `${Math.round(v / 10000)}万`} />
            <Tooltip formatter={(value) => formatYen(Number(value))} />
            <Legend />
            <Bar dataKey="budget" name="予算" fill="#4f7cff" />
            <Bar dataKey="actual" name="実績" fill="#ff9f43" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="summary-table">
        <thead>
          <tr>
            <th>部門</th>
            <th>予算</th>
            <th>実績</th>
            <th>差額</th>
            <th>執行率</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{formatYen(r.budget)}</td>
              <td>{formatYen(r.actual)}</td>
              <td className={r.diff < 0 ? 'negative' : ''}>{formatYen(r.diff)}</td>
              <td>{formatRate(r.rate)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>合計</td>
            <td>{formatYen(grandBudget)}</td>
            <td>{formatYen(grandActual)}</td>
            <td className={grandBudget - grandActual < 0 ? 'negative' : ''}>{formatYen(grandBudget - grandActual)}</td>
            <td>{formatRate(grandBudget === 0 ? null : (grandActual / grandBudget) * 100)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
