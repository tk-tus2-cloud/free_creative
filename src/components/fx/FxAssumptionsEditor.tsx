import { MONTH_LABELS } from '../../types'
import { USD_CODE, type FxCurrency, type FxData } from '../../fx/types'

interface Props {
  data: FxData
  onChange: (fn: (prev: FxData) => FxData) => void
}

export default function FxAssumptionsEditor({ data, onChange }: Props) {
  function updateCurrency(code: string, patch: Partial<FxCurrency>) {
    onChange((prev) => ({
      ...prev,
      currencies: prev.currencies.map((c) => (c.code === code ? { ...c, ...patch } : c)),
    }))
  }

  function updateMonthlyRate(code: string, monthIndex: number, value: number) {
    onChange((prev) => ({
      ...prev,
      currencies: prev.currencies.map((c) => {
        if (c.code !== code) return c
        const monthlyRates = [...c.monthlyRates]
        monthlyRates[monthIndex] = value
        return { ...c, monthlyRates }
      }),
    }))
  }

  return (
    <details className="fx-settings">
      <summary>前提データの編集(計画レート・感応度・エクスポージャー・月次実績レート)</summary>

      <h3>計画レート・感応度・エクスポージャー</h3>
      <div className="table-scroll">
        <table className="budget-table fx-settings-table">
          <thead>
            <tr>
              <th className="sticky-col">通貨</th>
              <th>計画レート(円)</th>
              <th>感応度(pt, 空欄=自動推計)</th>
              <th>外貨建て売上高(百万・現地通貨)</th>
              <th>外貨建て営業利益(百万・現地通貨)</th>
            </tr>
          </thead>
          <tbody>
            {data.currencies.map((c) => (
              <tr key={c.code}>
                <td className="sticky-col">
                  {c.name}({c.code})
                </td>
                <td>
                  <input
                    className="cell-input"
                    type="number"
                    step="any"
                    value={c.planRate}
                    onChange={(e) => updateCurrency(c.code, { planRate: Number(e.target.value) })}
                  />
                </td>
                <td>
                  {c.code === USD_CODE ? (
                    <span className="cell-readonly">1.00(基準)</span>
                  ) : (
                    <input
                      className="cell-input"
                      type="number"
                      step="any"
                      placeholder="自動"
                      value={c.betaOverride ?? ''}
                      onChange={(e) =>
                        updateCurrency(c.code, {
                          betaOverride: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                    />
                  )}
                </td>
                <td>
                  <input
                    className="cell-input"
                    type="number"
                    step="any"
                    value={c.salesExposure}
                    onChange={(e) => updateCurrency(c.code, { salesExposure: Number(e.target.value) })}
                  />
                </td>
                <td>
                  <input
                    className="cell-input"
                    type="number"
                    step="any"
                    value={c.profitExposure}
                    onChange={(e) => updateCurrency(c.code, { profitExposure: Number(e.target.value) })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>月次平均レート(0 = 未確定)</h3>
      <div className="table-scroll">
        <table className="budget-table fx-settings-table">
          <thead>
            <tr>
              <th className="sticky-col">通貨</th>
              {MONTH_LABELS.map((m) => (
                <th key={m}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.currencies.map((c) => (
              <tr key={c.code}>
                <td className="sticky-col">{c.code}</td>
                {c.monthlyRates.map((rate, i) => (
                  <td key={i}>
                    <input
                      className="cell-input fx-rate-input"
                      type="number"
                      step="any"
                      value={rate}
                      onChange={(e) => updateMonthlyRate(c.code, i, Number(e.target.value))}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
