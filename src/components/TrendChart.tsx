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
import { linreg, trailingMovingAverage } from '../utils/stats'

const MA_KEY = '__ma'
const TREND_KEY = '__trend'
const MA_LABEL = '3ヵ月移動平均'
const TREND_LABEL = 'トレンド（回帰直線）'

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
  const ma = total ? trailingMovingAverage(total, 3) : undefined
  const reg = total ? linreg(total) : undefined

  const rows = months.map((month, i) => {
    const row: Record<string, string | number | null> = { month: formatMonthShort(month), monthFull: month }
    for (const s of series) row[s.key] = s.values[i]
    if (total) row[totalLabel] = total[i]
    if (ma) row[MA_KEY] = ma[i]
    if (reg) row[TREND_KEY] = reg.start + ((reg.end - reg.start) * i) / (months.length - 1)
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
          <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} maKey={ma ? MA_KEY : undefined} />} />
          <Legend
            content={
              <CustomLegend series={series} total={total ? totalLabel : undefined} showTrend={Boolean(total)} />
            }
          />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} stackId="stack" fill={colorForIndex(i)} radius={[2, 2, 2, 2]} />
          ))}
          {reg && (
            <Line
              type="linear"
              dataKey={TREND_KEY}
              stroke="var(--accent)"
              strokeWidth={1.6}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
              legendType="none"
            />
          )}
          {ma && (
            <Line
              type="monotone"
              dataKey={MA_KEY}
              stroke="var(--muted)"
              strokeWidth={1.8}
              strokeDasharray="1 3"
              dot={false}
              connectNulls
              isAnimationActive={false}
              legendType="none"
            />
          )}
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

function CustomLegend({
  series,
  total,
  showTrend,
}: {
  series: SeriesData[]
  total?: string
  showTrend: boolean
}) {
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
      {showTrend && (
        <>
          <span className="chart-legend-item">
            <span className="chart-legend-line chart-legend-line--ma" />
            {MA_LABEL}
          </span>
          <span className="chart-legend-item">
            <span className="chart-legend-line chart-legend-line--trend" />
            {TREND_LABEL}
          </span>
        </>
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
  maKey,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  valueFormatter: (value: number) => string
  maKey?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  const visible = payload.filter((item) => item.dataKey !== TREND_KEY)
  const maItem = visible.find((item) => item.dataKey === maKey)
  const rest = visible.filter((item) => item.dataKey !== maKey)
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}</div>
      {rest
        .slice()
        .reverse()
        .map((item) => (
          <div className="chart-tooltip-row" key={item.dataKey}>
            <span className="chart-tooltip-key" style={{ borderColor: item.color }} />
            <span className="chart-tooltip-name">{item.dataKey}</span>
            <span className="chart-tooltip-value">{valueFormatter(item.value)}</span>
          </div>
        ))}
      {maItem && maItem.value != null && (
        <div className="chart-tooltip-row chart-tooltip-row--ma">
          <span className="chart-tooltip-key chart-tooltip-key--dotted" />
          <span className="chart-tooltip-name">{MA_LABEL}</span>
          <span className="chart-tooltip-value">{valueFormatter(maItem.value)}</span>
        </div>
      )}
    </div>
  )
}
