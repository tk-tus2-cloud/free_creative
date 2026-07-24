import { useEffect, useMemo, useState } from 'react'
import { buildStats, formatMillionYen, type BaselineComparison, type CurrencyStats } from '../../fx/calc'
import { loadFxData, saveFxData } from '../../fx/storage'
import type { FxData } from '../../fx/types'
import CurrencyRateCard from './CurrencyRateCard'
import FxAssumptionsEditor from './FxAssumptionsEditor'
import FxSimulator from './FxSimulator'

interface Props {
  fiscalYear: number
}

// 比較軸: 年平均レートを何と比較し、何の判断に使うか
const COMPARISON_AXES: {
  label: string
  purpose: string
  pick: (s: CurrencyStats) => BaselineComparison | null
}[] = [
  {
    label: '対 前年',
    purpose: '前年からの増減益要因の説明(実際に効いた為替影響)',
    pick: (s) => s.vsPrevYear,
  },
  {
    label: '対 期初計画',
    purpose: '年度予算(期初レート前提)の達成見通し',
    pick: (s) => s.vsInitialPlan,
  },
  {
    label: '対 修正計画',
    purpose: '期中修正後の直近見通しからの乖離(業績予想修正の判断)',
    pick: (s) => s.vsRevisedPlan,
  },
]

function sumImpact(
  stats: CurrencyStats[],
  pick: (s: CurrencyStats) => BaselineComparison | null,
  key: 'salesImpact' | 'profitImpact',
): number | null {
  const values = stats.map((s) => pick(s)?.[key]).filter((v): v is number => v !== null && v !== undefined)
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0)
}

export default function FxDashboard({ fiscalYear }: Props) {
  const [fxData, setFxData] = useState<FxData>(() => loadFxData())

  useEffect(() => {
    saveFxData(fxData)
  }, [fxData])

  const stats = useMemo(() => buildStats(fxData), [fxData])

  return (
    <div className="fx-dashboard">
      <div className="table-toolbar">
        <h2>{fiscalYear}年度 為替影響ダッシュボード</h2>
      </div>
      <p className="fx-note">
        ドル円が1円(約0.7%)動いたときに各国通貨が何%連動して動き、円換算でどの程度の損益影響になるかを可視化します。
        棒グラフは月平均レート、点線は期初計画(橙)・修正計画(緑)レートです。
      </p>

      <FxSimulator stats={stats} fiscalYear={fiscalYear} />

      <div className="table-toolbar fx-cards-toolbar">
        <h2>何と比較するか(年平均レートベースの年間影響)</h2>
      </div>
      <p className="fx-note">
        同じ「為替影響」でも、比較する基準によって意味が変わります。前年比は損益の増減要因の説明に、
        期初計画比は年度予算の達成見通しに、修正計画比は直近の業績予想からの上振れ・下振れの把握に使います。
      </p>
      <table className="summary-table fx-comparison-table">
        <thead>
          <tr>
            <th>比較軸</th>
            <th>見る目的</th>
            <th>売上高への影響</th>
            <th>営業利益への影響</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_AXES.map((axis) => {
            const sales = sumImpact(stats, axis.pick, 'salesImpact')
            const profit = sumImpact(stats, axis.pick, 'profitImpact')
            return (
              <tr key={axis.label}>
                <td>{axis.label}</td>
                <td className="fx-purpose">{axis.purpose}</td>
                <td className={sales !== null && sales < 0 ? 'negative' : ''}>{formatMillionYen(sales, true)}</td>
                <td className={profit !== null && profit < 0 ? 'negative' : ''}>{formatMillionYen(profit, true)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="table-toolbar fx-cards-toolbar">
        <h2>通貨別レート状況(期初計画・修正計画との比較)</h2>
      </div>
      <div className="fx-cards-grid">
        {stats.map((s) => (
          <CurrencyRateCard key={s.currency.code} stats={s} />
        ))}
      </div>

      <details className="fx-settings">
        <summary>計算モデルの説明</summary>
        <div className="fx-model">
          <h3>基本の考え方</h3>
          <p>
            円安・円高がライオンの業績に与える影響は、性質の異なる2つの要因に分解して計算します。
          </p>
          <ol>
            <li>
              <strong>換算影響</strong>: 海外子会社が現地通貨で稼いだ売上・営業利益を円に換算する際の影響。
              円安になると円換算額が増えるため<strong>プラス</strong>に働きます。
            </li>
            <li>
              <strong>取引影響</strong>: ドル建ての原材料輸入など、外貨での支払い・受け取りそのものへの影響。
              支払いが超過している通貨(ドルなど)は、円安になるとコストが増えるため<strong>マイナス</strong>に働きます。
              為替予約などでヘッジしている分は影響から除きます。
            </li>
          </ol>

          <h3>計算式</h3>
          <pre className="fx-formula">
{`① 各通貨のレート変化(円) = 現在レート × 感応度β × ドル円の変化率
② 売上高への影響        = 海外子会社の売上高(百万・現地通貨) × ①
③ 換算影響(営業利益)   = 海外子会社の営業利益(百万・現地通貨) × ①
④ 取引影響(営業利益)   = 純受払額(受取+/支払−) × (1 − ヘッジ率) × ①
⑤ 営業利益への影響合計   = ③ + ④ を全通貨で合算`}
          </pre>

          <h3>感応度β(ドル円1%の変化に対して何pt動くか)</h3>
          <p>
            為替相場はドル主導で動くことが多いため、シナリオ入力はドル円1本に集約し、
            他の通貨は「ドル円が1%動いたときに何%つられて動くか」(感応度β)で連動させます。
            βは月次平均レートの前月比変化率をドル円の変化率に回帰(原点通過の最小二乗法)して自動推計します。
            相場の局面が変わった場合や、特定通貨だけ動かしたい場合は、前提データの編集で手動上書きできます
            (例: 他通貨のβを0にすればドル円単独のシナリオになります)。
          </p>

          <h3>何と比較するか(3つの比較基準)</h3>
          <p>
            年平均レートを「前年平均」「期初計画」「修正計画」の3つの基準と比較し、それぞれ
            影響額 = (年平均レート − 基準レート) × エクスポージャー(換算+ヘッジ後取引)で算出します。
          </p>
          <ul>
            <li>
              <strong>対 前年</strong>: 前年からの増減益のうち為替で説明できる部分。決算説明の増減益分析に使用。
            </li>
            <li>
              <strong>対 期初計画</strong>: 年度予算のレート前提からの乖離。予算達成の見通し・未達リスクの把握に使用。
            </li>
            <li>
              <strong>対 修正計画</strong>: 期中に見直した直近レート前提からの乖離。業績予想の再修正が必要かの判断に使用。
              未修正の通貨は期初計画のみで評価されます。
            </li>
          </ul>

          <h3>前提と限界</h3>
          <ul>
            <li>影響額は年間換算・線形近似です。変動幅が大きい場合は誤差が広がります。</li>
            <li>
              取引影響は即時反映と仮定しています。実際は在庫を経由して3〜6か月遅れて原価に効くため、
              精緻化する場合は四半期ラグの組み込みが次のステップです。
            </li>
            <li>βは過去実績に基づく推計であり、将来の連動を保証するものではありません。</li>
            <li>現在の数値はサンプルです。実運用では財務部門の実数に差し替えてください。</li>
          </ul>
        </div>
      </details>

      <FxAssumptionsEditor data={fxData} onChange={setFxData} />
    </div>
  )
}
