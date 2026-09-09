import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface YoyChartProps {
  title: string
  months: string[]
  total: number[]
  valueFormatter: (value: number) => string
  tickFormatter: (value: number) => string
}

export default function YoyChart({ title, months, total, valueFormatter, tickFormatter }: YoyChartProps) {
  const labels = months.slice(0, 8).map((m) => m.slice(5))
  const y2025 = total.slice(0, 8)
  const y2026 = total.slice(12, 20)
  const rows = labels.map((label, i) => ({ label, '2025年': y2025[i], '2026年': y2026[i] }))

  return (
    <div className="yoy-block">
      <p className="yoy-title">{title}</p>
      <p className="yoy-sub">2025年と2026年の同月を並べて比較し、増減の内訳月を確認できます。</p>
      <div className="chart-card">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }} barGap={2}>
            <CartesianGrid stroke="var(--gridline)" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--baseline)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={60}
              tickFormatter={tickFormatter}
            />
            <Tooltip content={<YoyTooltip valueFormatter={valueFormatter} />} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} iconType="rect" />
            <Bar dataKey="2025年" fill="var(--accent)" fillOpacity={0.35} radius={[2, 2, 0, 0]} />
            <Bar dataKey="2026年" fill="var(--accent)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface YoyPayloadItem {
  dataKey: string
  value: number
  color: string
  fillOpacity?: number
}

function YoyTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean
  payload?: YoyPayloadItem[]
  label?: string
  valueFormatter: (value: number) => string
}) {
  if (!active || !payload || payload.length < 2) return null
  const a = payload[0]
  const b = payload[1]
  const pct = ((b.value - a.value) / a.value) * 100
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}（前年同月比較）</div>
      {payload.map((item) => (
        <div className="chart-tooltip-row" key={item.dataKey}>
          <span
            className="chart-tooltip-key"
            style={{ borderColor: item.color, opacity: item.fillOpacity ?? 1 }}
          />
          <span className="chart-tooltip-name">{item.dataKey}</span>
          <span className="chart-tooltip-value">{valueFormatter(item.value)}</span>
        </div>
      ))}
      <div className="chart-tooltip-row chart-tooltip-row--ma">
        <span className="chart-tooltip-name">前年比</span>
        <span className="chart-tooltip-value">
          {pct >= 0 ? '+' : ''}
          {pct.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}
