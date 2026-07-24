import { useEffect, useMemo, useState } from 'react'
import { buildStats, formatMillionYen } from '../../fx/calc'
import { loadFxData, saveFxData } from '../../fx/storage'
import type { FxData } from '../../fx/types'
import CurrencyRateCard from './CurrencyRateCard'
import FxAssumptionsEditor from './FxAssumptionsEditor'
import FxSimulator from './FxSimulator'

interface Props {
  fiscalYear: number
}

export default function FxDashboard({ fiscalYear }: Props) {
  const [fxData, setFxData] = useState<FxData>(() => loadFxData())

  useEffect(() => {
    saveFxData(fxData)
  }, [fxData])

  const stats = useMemo(() => buildStats(fxData), [fxData])

  const planGapProfitTotal = stats.reduce((a, s) => a + (s.planGapProfit ?? 0), 0)
  const planGapSalesTotal = stats.reduce((a, s) => a + (s.planGapSales ?? 0), 0)

  return (
    <div className="fx-dashboard">
      <div className="table-toolbar">
        <h2>{fiscalYear}年度 為替影響ダッシュボード</h2>
      </div>
      <p className="fx-note">
        ドル円が1円(約0.7%)動いたときに各国通貨が何%連動して動き、円換算でどの程度の損益影響になるかを可視化します。
        棒グラフは月平均レート、点線は計画レートです。
      </p>

      <FxSimulator stats={stats} fiscalYear={fiscalYear} />

      <div className="table-toolbar fx-cards-toolbar">
        <h2>通貨別レート状況(計画レートからの変化)</h2>
        <span className="fx-plan-gap">
          対計画の年間影響(年平均レートベース): 売上高 {formatMillionYen(planGapSalesTotal, true)} / 営業利益{' '}
          {formatMillionYen(planGapProfitTotal, true)}
        </span>
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

          <h3>対計画影響</h3>
          <p>
            通貨別カードの「年平均レート / 計画レート」は予算前提からの乖離を示し、
            対計画の年間影響 = (年平均レート − 計画レート) × エクスポージャー(換算+ヘッジ後取引)で算出しています。
          </p>

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
