import type { SeriesData } from '../data/trendData'
import { downloadCsv } from '../utils/format'

interface DataTableProps {
  months: string[]
  series: SeriesData[]
  total?: number[]
  totalLabel?: string
  valueFormatter: (value: number) => string
  csvFilename: string
}

export default function DataTable({ months, series, total, totalLabel = '合計', valueFormatter, csvFilename }: DataTableProps) {
  const handleExport = () => {
    const header = ['科目', ...months]
    const rows = series.map((s) => [s.key, ...s.values])
    if (total) rows.push([totalLabel, ...total])
    downloadCsv(csvFilename, [header, ...rows])
  }

  return (
    <div className="data-table-wrap">
      <div className="data-table-toolbar">
        <button type="button" className="btn-secondary" onClick={handleExport}>
          CSV出力
        </button>
      </div>
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th className="data-table-rowhead">科目</th>
              {months.map((m) => (
                <th key={m}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {series.map((s) => (
              <tr key={s.key}>
                <th className="data-table-rowhead">{s.key}</th>
                {s.values.map((v, i) => (
                  <td key={i} className={v < 0 ? 'neg' : undefined}>
                    {valueFormatter(v)}
                  </td>
                ))}
              </tr>
            ))}
            {total && (
              <tr className="data-table-total">
                <th className="data-table-rowhead">{totalLabel}</th>
                {total.map((v, i) => (
                  <td key={i} className={v < 0 ? 'neg' : undefined}>
                    {valueFormatter(v)}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
