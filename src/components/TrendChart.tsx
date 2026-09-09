import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SeriesData } from '../data/trendData'
import { colorForIndex } from '../utils/palette'
import { formatMonthShort } from '../utils/format'

interface TrendChartProps {
  months: string[]
  series: SeriesData[]
  total?: number[]
  totalLabel?: string
  valueFormatter: (value: number) => string
  unitLabel: string
}

export default function TrendChart({
  months,
  series,
  total,
  totalLabel = '合計',
  valueFormatter,
  unitLabel,
}: TrendChartProps) {
  const rows = months.map((month, i) => {
    const row: Record<string, string | number> = { month: formatMonthShort(month), monthFull: month }
    for (const s of series) row[s.key] = s.values[i]
    if (total) row[totalLabel] = total[i]
    return row
  })

  return (
    <div className="chart-card">
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }} barCategoryGap={4}>
          <CartesianGrid stroke="var(--gridline)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--baseline)' }}
            tickLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={72}
            tickFormatter={(v: number) => (unitLabel === '円' ? `${Math.round(v / 1_000_000)}M` : v.toLocaleString('ja-JP'))}
          />
          <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
          <Legend content={<CustomLegend series={series} total={total ? totalLabel : undefined} />} />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} stackId="stack" fill={colorForIndex(i)} radius={[2, 2, 2, 2]} />
          ))}
          {total && (
            <Line
              type="monotone"
              dataKey={totalLabel}
              stroke="var(--text-primary)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--text-primary)', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function CustomLegend({ series, total }: { series: SeriesData[]; total?: string }) {
  return (
    <div className="chart-legend">
      {series.map((s, i) => (
        <span className="chart-legend-item" key={s.key}>
          <span className="chart-legend-swatch" style={{ background: colorForIndex(i) }} />
          {s.key}
        </span>
      ))}
      {total && (
        <span className="chart-legend-item">
          <span className="chart-legend-line" />
          {total}
        </span>
      )}
    </div>
  )
}

interface TooltipPayloadItem {
  dataKey: string
  value: number
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  valueFormatter: (value: number) => string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}</div>
      {payload
        .slice()
        .reverse()
        .map((item) => (
          <div className="chart-tooltip-row" key={item.dataKey}>
            <span className="chart-tooltip-key" style={{ borderColor: item.color }} />
            <span className="chart-tooltip-name">{item.dataKey}</span>
            <span className="chart-tooltip-value">{valueFormatter(item.value)}</span>
          </div>
        ))}
    </div>
  )
}
