import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  formatMillionYen,
  formatOkuYen,
  formatRateValue,
  formatSignedPct,
  simulate,
  type CurrencyStats,
} from '../../fx/calc'
import { downloadCsv } from '../../utils/format'

const SALES_COLOR = '#2a78d6'
const PROFIT_COLOR = '#eb6834'
const QUICK_DELTAS = [-5, -1, 1, 5]

interface Props {
  stats: CurrencyStats[]
  fiscalYear: number
}

export default function FxSimulator({ stats, fiscalYear }: Props) {
  const [deltaYen, setDeltaYen] = useState(1)

  const result = useMemo(() => simulate(stats, deltaYen), [stats, deltaYen])
  const perYen = useMemo(() => simulate(stats, 1), [stats])

  if (!result || !perYen) {
    return <p className="empty-state">ドル円のレートが未入力のためシミュレーションできません。</p>
  }

  const chartData = result.rows.map((r) => ({
    name: r.code,
    sales: Math.round(r.salesImpact),
    profit: Math.round(r.profitImpact),
  }))

  function handleExportCsv() {
    if (!result) return
    const header = [
      '通貨',
      '感応度(pt)',
      '現在レート',
      'シミュレーションレート',
      '変化率(%)',
      '売上高影響(百万円)',
      '営業利益影響(百万円)',
    ]
    const body = result.rows.map((r) => [
      `${r.name}(${r.code})`,
      r.beta.toFixed(2),
      r.baseRate.toFixed(r.digits),
      r.newRate.toFixed(r.digits),
      (r.changePct * 100).toFixed(2),
      Math.round(r.salesImpact),
      Math.round(r.profitImpact),
    ])
    const footer = ['合計', '', '', '', '', Math.round(result.totalSales), Math.round(result.totalProfit)]
    const sign = deltaYen >= 0 ? '+' : ''
    downloadCsv(`${fiscalYear}年度_為替影響シミュレーション_ドル円${sign}${deltaYen}円.csv`, [header, ...body, footer])
  }

  return (
    <section className="fx-sim-panel">
      <div className="table-toolbar">
        <h2>為替影響シミュレーション</h2>
        <button type="button" className="secondary" onClick={handleExportCsv}>
          CSV出力
        </button>
      </div>
      <p className="fx-note">
        ドル円が動いたとき、各国通貨が感応度(ドル円1%の変化に対する連動 pt)に応じて動くと仮定し、
        外貨建てエクスポージャーへの年間影響額を円換算で試算します。
      </p>

      <div className="fx-sim-controls">
        <label htmlFor="fx-delta-slider">ドル円の変動幅</label>
        <div className="fx-quick-buttons">
          {QUICK_DELTAS.map((d) => (
            <button
              key={d}
              type="button"
              className={deltaYen === d ? 'active' : ''}
              onClick={() => setDeltaYen(d)}
            >
              {d > 0 ? `+${d}円` : `${d}円`}
            </button>
          ))}
        </div>
        <input
          id="fx-delta-slider"
          type="range"
          min={-10}
          max={10}
          step={0.5}
          value={deltaYen}
          onChange={(e) => setDeltaYen(Number(e.target.value))}
        />
        <div className="fx-sim-scenario">
          {formatRateValue(result.usdBase, 1)}円 →{' '}
          <strong>{formatRateValue(result.usdBase + deltaYen, 1)}円</strong>
          <span className="fx-kpi-sub">
            ({deltaYen >= 0 ? '+' : ''}
            {deltaYen.toFixed(1)}円 / {formatSignedPct(result.usdChangePct)})
          </span>
        </div>
      </div>

      <div className="fx-kpi-row">
        <div className="fx-kpi-tile">
          <span className="fx-kpi-label">売上高への影響(年間)</span>
          <span className={`fx-kpi-value ${result.totalSales < 0 ? 'fx-down' : 'fx-up'}`}>
            {formatMillionYen(result.totalSales, true)}
          </span>
          <span className="fx-kpi-sub">{formatOkuYen(result.totalSales, true)}</span>
        </div>
        <div className="fx-kpi-tile">
          <span className="fx-kpi-label">営業利益への影響(年間)</span>
          <span className={`fx-kpi-value ${result.totalProfit < 0 ? 'fx-down' : 'fx-up'}`}>
            {formatMillionYen(result.totalProfit, true)}
          </span>
          <span className="fx-kpi-sub">{formatOkuYen(result.totalProfit, true)}</span>
        </div>
        <div className="fx-kpi-tile">
          <span className="fx-kpi-label">ドル円1円あたりの感応度</span>
          <span className="fx-kpi-value">{formatMillionYen(perYen.totalProfit, true)}</span>
          <span className="fx-kpi-sub">営業利益/円(売上高 {formatMillionYen(perYen.totalSales, true)}/円)</span>
        </div>
      </div>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${Number(v).toLocaleString('ja-JP')}`}
              label={{ value: '百万円', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip formatter={(value) => formatMillionYen(Number(value), true)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={0} stroke="#898781" />
            <Bar dataKey="sales" name="売上高影響" fill={SALES_COLOR} radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" name="営業利益影響" fill={PROFIT_COLOR} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="summary-table">
        <thead>
          <tr>
            <th>通貨</th>
            <th>感応度</th>
            <th>現在レート</th>
            <th>シミュレーション</th>
            <th>変化率</th>
            <th>売上高影響</th>
            <th>営業利益影響</th>
          </tr>
        </thead>
        <tbody>
          {result.rows.map((r) => (
            <tr key={r.code}>
              <td>
                {r.name}({r.code})
              </td>
              <td>{r.beta.toFixed(2)} pt</td>
              <td>{formatRateValue(r.baseRate, r.digits)}</td>
              <td>{formatRateValue(r.newRate, r.digits)}</td>
              <td className={r.changePct < 0 ? 'negative' : ''}>{formatSignedPct(r.changePct)}</td>
              <td className={r.salesImpact < 0 ? 'negative' : ''}>{formatMillionYen(r.salesImpact, true)}</td>
              <td className={r.profitImpact < 0 ? 'negative' : ''}>{formatMillionYen(r.profitImpact, true)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>合計</td>
            <td colSpan={4}></td>
            <td className={result.totalSales < 0 ? 'negative' : ''}>{formatMillionYen(result.totalSales, true)}</td>
            <td className={result.totalProfit < 0 ? 'negative' : ''}>{formatMillionYen(result.totalProfit, true)}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  )
}
