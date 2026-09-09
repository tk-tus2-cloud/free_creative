import './App.css'
import TrendChart from './components/TrendChart'
import DataTable from './components/DataTable'
import KpiTiles from './components/KpiTiles'
import InsightList from './components/InsightList'
import YoyChart from './components/YoyChart'
import {
  months,
  overtimeHoursByCategory,
  overtimeHoursTotal,
  wageComponents,
  wageTotal,
} from './data/trendData'
import { formatHours, formatYen } from './utils/format'
import { arrowFor, trendStats } from './utils/stats'

const WAGE_INSIGHTS = [
  '全体は回帰直線で見ると20ヵ月で+4.6%の緩やかな増加トレンドだが、月ごとの振れ幅（99百万円〜163百万円）が大きく、季節的な凹凸を伴う。',
  '前年同期比（1〜8月合計）は+1.6%。ただし2025年1〜4月は前年比+3〜9%台の増加が続いた一方、2025年5〜8月は前年比-1〜8%の減少に転じており、直近は伸びが鈍化している。',
  'マネジメント手当は前年同期比+13.4%と構成要素の中で最も伸びが大きい。',
  '.SF用減額（控除）は前年同期比-21.5%（絶対値では増加）で、控除額が拡大傾向にある。特殊勤務手当は前年同期比-4.1%とやや縮小。',
  '時間外手当（最大の構成要素、平均月120.3百万円）は前年同期比+1.1%とほぼ横ばい。',
]

const HOURS_INSIGHTS = [
  '全体は回帰直線で見ると20ヵ月で-3.3%のやや減少トレンド。前年同期比（1〜8月合計）も-2.9%で、金額側とは異なり時間は減少方向にある。',
  '2026年1〜3月は前年同月比+2〜7%で増加していたが、2026年4月以降は前年比-1〜13%の減少が続き、特に5月は-12.9%と大きく減少している。',
  '海外BUは前年同期比+90.9%（6,968時間→13,303時間）と大幅増加。海外拠点の業務量拡大が所定外時間を押し上げている可能性がある。',
  '研究技術センターは前年同期比-34.0%、生産技術センターは-19.0%、コーポレートは-7.7%とそれぞれ減少。組織区分ごとに動きが分かれている。',
  '国内BU（最大区分、平均月25,875時間）は前年同期比±0.0%でほぼ横ばい。',
]

function App() {
  const rangeLabel = `${months[0]} 〜 ${months[months.length - 1]}`
  const wageStats = trendStats(wageTotal)
  const hoursStats = trendStats(overtimeHoursTotal)

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>基準外賃金・所定外労働時間 推移分析</h1>
        <p className="app-subtitle">対象期間: {rangeLabel}</p>
      </header>

      <main className="app-main">
        <section className="section">
          <div className="section-head">
            <h2>基準外の構成要素の金額推移</h2>
            <p className="section-desc">
              基準外賃金合計を科目別（時間外手当・休出手当・特殊勤務手当など）に分解した月次金額の推移です。太線は基準外賃金合計、点線は3ヵ月移動平均、破線は回帰直線（全体トレンド）を示します。
            </p>
          </div>
          <KpiTiles
            tiles={[
              {
                label: '20ヵ月トレンド（回帰直線）',
                arrow: arrowFor(wageStats.pctOverPeriod),
                value: `${wageStats.pctOverPeriod >= 0 ? '+' : ''}${wageStats.pctOverPeriod.toFixed(1)}%`,
                caption: `月あたり${wageStats.reg.slope >= 0 ? '+' : ''}${Math.round(wageStats.reg.slope).toLocaleString('ja-JP')}円　(${formatYen(wageStats.reg.start)} → ${formatYen(wageStats.reg.end)})`,
              },
              {
                label: '前年同期比（1〜8月合計）',
                arrow: arrowFor(wageStats.yoyPct),
                value: `${wageStats.yoyPct >= 0 ? '+' : ''}${wageStats.yoyPct.toFixed(1)}%`,
                caption: `2025年1-8月 ${formatYen(wageStats.yoy25)} → 2026年1-8月 ${formatYen(wageStats.yoy26)}`,
              },
            ]}
          />
          <TrendChart
            months={months}
            series={wageComponents}
            total={wageTotal}
            totalLabel="基準外賃金合計"
            valueFormatter={formatYen}
            unitLabel="円"
          />
          <InsightList title="基準外賃金のインサイト" bullets={WAGE_INSIGHTS} />
          <YoyChart
            title="基準外賃金合計：前年同月比較"
            months={months}
            total={wageTotal}
            valueFormatter={formatYen}
            tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`}
          />
          <DataTable
            months={months}
            series={wageComponents}
            total={wageTotal}
            totalLabel="基準外賃金合計"
            valueFormatter={formatYen}
            csvFilename="基準外賃金_構成要素別推移.csv"
          />
        </section>

        <section className="section">
          <div className="section-head">
            <h2>所定外時間の推移</h2>
            <p className="section-desc">
              所定外労働時間（時間外勤務＋深夜勤務＋休出時間外法外・法定）を組織区分別に分解した月次時間の推移です。太線は単体+関係会社の合計、点線は3ヵ月移動平均、破線は回帰直線（全体トレンド）を示します。
            </p>
          </div>
          <KpiTiles
            tiles={[
              {
                label: '20ヵ月トレンド（回帰直線）',
                arrow: arrowFor(hoursStats.pctOverPeriod),
                value: `${hoursStats.pctOverPeriod >= 0 ? '+' : ''}${hoursStats.pctOverPeriod.toFixed(1)}%`,
                caption: `月あたり${hoursStats.reg.slope >= 0 ? '+' : ''}${hoursStats.reg.slope.toFixed(1)}時間　(${formatHours(hoursStats.reg.start)} → ${formatHours(hoursStats.reg.end)})`,
              },
              {
                label: '前年同期比（1〜8月合計）',
                arrow: arrowFor(hoursStats.yoyPct),
                value: `${hoursStats.yoyPct >= 0 ? '+' : ''}${hoursStats.yoyPct.toFixed(1)}%`,
                caption: `2025年1-8月 ${formatHours(hoursStats.yoy25)} → 2026年1-8月 ${formatHours(hoursStats.yoy26)}`,
              },
            ]}
          />
          <TrendChart
            months={months}
            series={overtimeHoursByCategory}
            total={overtimeHoursTotal}
            totalLabel="単体+関係会社計"
            valueFormatter={formatHours}
            unitLabel="時間"
          />
          <InsightList title="所定外労働時間のインサイト" bullets={HOURS_INSIGHTS} />
          <YoyChart
            title="所定外労働時間合計：前年同月比較"
            months={months}
            total={overtimeHoursTotal}
            valueFormatter={formatHours}
            tickFormatter={(v) => Math.round(v).toLocaleString('ja-JP')}
          />
          <DataTable
            months={months}
            series={overtimeHoursByCategory}
            total={overtimeHoursTotal}
            totalLabel="単体+関係会社計"
            valueFormatter={formatHours}
            csvFilename="所定外労働時間_組織区分別推移.csv"
          />
        </section>
      </main>
    </div>
  )
}

export default App
