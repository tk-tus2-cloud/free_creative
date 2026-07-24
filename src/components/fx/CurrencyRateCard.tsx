import { useMemo } from 'react'
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
import { MONTH_LABELS } from '../../types'
import { formatRateValue, type CurrencyStats } from '../../fx/calc'
import { USD_CODE } from '../../fx/types'

const ACTUAL_COLOR = '#2a78d6'
const PLAN_COLOR = '#eb6834'

interface Props {
  stats: CurrencyStats
}

export default function CurrencyRateCard({ stats }: Props) {
  const { currency } = stats

  const chartData = useMemo(
    () =>
      MONTH_LABELS.map((month, i) => ({
        month,
        actual: currency.monthlyRates[i] > 0 ? currency.monthlyRates[i] : null,
        plan: currency.planRate,
      })),
    [currency],
  )

  const fmt = (v: number) => formatRateValue(v, currency.digits)
  const isUsd = currency.code === USD_CODE
  const ratioClass =
    stats.planRatio === null ? '' : stats.planRatio >= 100 ? 'fx-up' : 'fx-down'

  return (
    <section className="fx-card">
      <header className="fx-card-header">
        <h3>
          {currency.name}({currency.code})
        </h3>
        <span className="fx-card-unit">円/{currency.code}</span>
      </header>

      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={1} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} tickFormatter={fmt} width={52} />
          <Tooltip formatter={(value) => fmt(Number(value))} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="actual" name="月平均レート" fill={ACTUAL_COLOR} radius={[4, 4, 0, 0]} />
          <Line
            dataKey="plan"
            name="計画レート"
            stroke={PLAN_COLOR}
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <dl className="fx-card-kpis">
        <div>
          <dt>年平均レート / 計画レート</dt>
          <dd className={ratioClass}>
            {stats.planRatio === null ? '-' : `${stats.planRatio.toFixed(1)}%`}
            <span className="fx-kpi-sub">
              ({formatRateValue(stats.yearAvg, currency.digits)} / {fmt(currency.planRate)})
            </span>
          </dd>
        </div>
        <div>
          <dt>ドル円1%の変化に対して</dt>
          <dd>
            {stats.beta.toFixed(2)} pt
            <span className="fx-kpi-sub">
              {isUsd ? '(基準通貨)' : stats.betaIsAuto ? '(実績から推計)' : '(手動設定)'}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  )
}
