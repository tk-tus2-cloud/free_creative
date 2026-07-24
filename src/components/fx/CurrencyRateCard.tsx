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
import { formatRateValue, type BaselineComparison, type CurrencyStats } from '../../fx/calc'
import { USD_CODE } from '../../fx/types'

const ACTUAL_COLOR = '#2a78d6'
const INITIAL_PLAN_COLOR = '#eb6834'
const REVISED_PLAN_COLOR = '#1baf7a'

interface Props {
  stats: CurrencyStats
}

function RatioKpi({ label, comparison }: { label: string; comparison: BaselineComparison | null }) {
  const ratio = comparison?.ratio ?? null
  const ratioClass = ratio === null ? '' : ratio >= 100 ? 'fx-up' : 'fx-down'
  return (
    <div>
      <dt>{label}</dt>
      <dd className={ratioClass}>{ratio === null ? '-' : `${ratio.toFixed(1)}%`}</dd>
    </div>
  )
}

export default function CurrencyRateCard({ stats }: Props) {
  const { currency } = stats

  const chartData = useMemo(
    () =>
      MONTH_LABELS.map((month, i) => ({
        month,
        actual: currency.monthlyRates[i] > 0 ? currency.monthlyRates[i] : null,
        initialPlan: currency.initialPlanRate,
        revisedPlan: currency.revisedPlanRate,
      })),
    [currency],
  )

  const fmt = (v: number) => formatRateValue(v, currency.digits)
  const isUsd = currency.code === USD_CODE

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
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="actual" name="月平均レート" fill={ACTUAL_COLOR} radius={[4, 4, 0, 0]} />
          <Line
            dataKey="initialPlan"
            name="期初計画"
            stroke={INITIAL_PLAN_COLOR}
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
          />
          {currency.revisedPlanRate !== null && (
            <Line
              dataKey="revisedPlan"
              name="修正計画"
              stroke={REVISED_PLAN_COLOR}
              strokeWidth={2}
              strokeDasharray="2 3"
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <dl className="fx-card-kpis fx-card-kpis-3">
        <RatioKpi label="年平均 / 期初計画" comparison={stats.vsInitialPlan} />
        <RatioKpi label="年平均 / 修正計画" comparison={stats.vsRevisedPlan} />
        <div>
          <dt>ドル円1%に対して</dt>
          <dd>
            {stats.beta.toFixed(2)} pt
            <span className="fx-kpi-sub">
              {isUsd ? '(基準)' : stats.betaIsAuto ? '(推計)' : '(手動)'}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  )
}
