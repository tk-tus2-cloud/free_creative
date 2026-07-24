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

const TRANSLATION_COLOR = '#2a78d6'
const TRANSACTION_COLOR = '#eb6834'
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
    translation: Math.round(r.translationImpact),
    transaction: Math.round(r.transactionImpact),
  }))

  function handleExportCsv() {
    if (!result) return
    const header = [
      '通貨',
      '感応度(pt)',
      '現在レート',
      'シミュレーションレート',
      '変化率(%)',
      '売上高影響:換算(百万円)',
      '営業利益影響:換算(百万円)',
      '営業利益影響:取引・ヘッジ後(百万円)',
      '営業利益影響:合計(百万円)',
    ]
    const body = result.rows.map((r) => [
      `${r.name}(${r.code})`,
      r.beta.toFixed(2),
      r.baseRate.toFixed(r.digits),
      r.newRate.toFixed(r.digits),
      (r.changePct * 100).toFixed(2),
      Math.round(r.salesImpact),
      Math.round(r.translationImpact),
      Math.round(r.transactionImpact),
      Math.round(r.profitImpact),
    ])
    const footer = [
      '合計',
      '',
      '',
      '',
      '',
      Math.round(result.totalSales),
      Math.round(result.totalTranslation),
      Math.round(result.totalTransaction),
      Math.round(result.totalProfit),
    ]
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
        ドル円が動いたとき、各国通貨が感応度(ドル円1%の変化に対する連動 pt)に応じて動くと仮定した年間影響額の試算です。
        営業利益への影響 = <strong>換算影響</strong>(海外子会社の売上・利益の円換算。円安でプラス) +{' '}
        <strong>取引影響</strong>(ドル建て原材料輸入などヘッジ後の純受払。支払超過の通貨は円安でマイナス)。
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
          <span className="fx-kpi-label">売上高への影響(年間・換算)</span>
          <span className={`fx-kpi-value ${result.totalSales < 0 ? 'fx-down' : 'fx-up'}`}>
            {formatMillionYen(result.totalSales, true)}
          </span>
          <span className="fx-kpi-sub">{formatOkuYen(result.totalSales, true)}</span>
        </div>
        <div className="fx-kpi-tile">
          <span className="fx-kpi-label">営業利益への影響(年間・合計)</span>
          <span className={`fx-kpi-value ${result.totalProfit < 0 ? 'fx-down' : 'fx-up'}`}>
            {formatMillionYen(result.totalProfit, true)}
          </span>
          <span className="fx-kpi-sub">
            換算 {formatMillionYen(result.totalTranslation, true)} / 取引{' '}
            {formatMillionYen(result.totalTransaction, true)}
          </span>
        </div>
        <div className="fx-kpi-tile">
          <span className="fx-kpi-label">ドル円1円(円安)あたりの営業利益感応度</span>
          <span className="fx-kpi-value">{formatMillionYen(perYen.totalProfit, true)}</span>
          <span className="fx-kpi-sub">
            換算 {formatMillionYen(perYen.totalTranslation, true)} / 取引{' '}
            {formatMillionYen(perYen.totalTransaction, true)}
          </span>
        </div>
      </div>

      <div className="chart-box">
        <h3 className="fx-chart-title">営業利益への影響(通貨別・要因別)</h3>
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
            <Bar dataKey="translation" name="換算影響" fill={TRANSLATION_COLOR} radius={[4, 4, 0, 0]} />
            <Bar dataKey="transaction" name="取引影響(ヘッジ後)" fill={TRANSACTION_COLOR} radius={[4, 4, 0, 0]} />
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
            <th>売上高(換算)</th>
            <th>営業利益(換算)</th>
            <th>営業利益(取引)</th>
            <th>営業利益(合計)</th>
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
              <td className={r.translationImpact < 0 ? 'negative' : ''}>
                {formatMillionYen(r.translationImpact, true)}
              </td>
              <td className={r.transactionImpact < 0 ? 'negative' : ''}>
                {formatMillionYen(r.transactionImpact, true)}
              </td>
              <td className={r.profitImpact < 0 ? 'negative' : ''}>{formatMillionYen(r.profitImpact, true)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>合計</td>
            <td colSpan={4}></td>
            <td className={result.totalSales < 0 ? 'negative' : ''}>{formatMillionYen(result.totalSales, true)}</td>
            <td className={result.totalTranslation < 0 ? 'negative' : ''}>
              {formatMillionYen(result.totalTranslation, true)}
            </td>
            <td className={result.totalTransaction < 0 ? 'negative' : ''}>
              {formatMillionYen(result.totalTransaction, true)}
            </td>
            <td className={result.totalProfit < 0 ? 'negative' : ''}>{formatMillionYen(result.totalProfit, true)}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  )
}
