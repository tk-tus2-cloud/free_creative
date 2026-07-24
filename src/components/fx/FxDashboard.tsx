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

      <FxAssumptionsEditor data={fxData} onChange={setFxData} />
    </div>
  )
}
