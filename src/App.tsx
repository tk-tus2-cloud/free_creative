import './App.css'
import TrendChart from './components/TrendChart'
import DataTable from './components/DataTable'
import {
  months,
  overtimeHoursByCategory,
  overtimeHoursTotal,
  wageComponents,
  wageTotal,
} from './data/trendData'
import { formatHours, formatYen } from './utils/format'

function App() {
  const rangeLabel = `${months[0]} 〜 ${months[months.length - 1]}`

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
              基準外賃金合計を科目別（時間外手当・休出手当・特殊勤務手当など）に分解した月次金額の推移です。黒線は基準外賃金合計を示します。
            </p>
          </div>
          <TrendChart
            months={months}
            series={wageComponents}
            total={wageTotal}
            totalLabel="基準外賃金合計"
            valueFormatter={formatYen}
            unitLabel="円"
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
              所定外労働時間（時間外勤務＋深夜勤務＋休出時間外法外・法定）を組織区分別に分解した月次時間の推移です。黒線は単体+関係会社の合計を示します。
            </p>
          </div>
          <TrendChart
            months={months}
            series={overtimeHoursByCategory}
            total={overtimeHoursTotal}
            totalLabel="単体+関係会社計"
            valueFormatter={formatHours}
            unitLabel="時間"
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
