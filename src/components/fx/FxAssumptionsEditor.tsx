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
      <p className="fx-settings-hint">
        期初計画レートは年度予算の前提、修正計画レートは期中見直し後の前提(空欄=未修正)、前年平均レートは前年比較の基準です。
        換算エクスポージャーは海外子会社の年間売上高・営業利益、取引エクスポージャーは輸出入などの年間純受払額(受取+/支払−。原材料輸入の支払超過ならマイナス)を百万・現地通貨で入力します。
      </p>
      <div className="table-scroll">
        <table className="budget-table fx-settings-table">
          <thead>
            <tr>
              <th className="sticky-col">通貨</th>
              <th>期初計画レート(円)</th>
              <th>修正計画レート(円, 空欄=未修正)</th>
              <th>前年平均レート(円)</th>
              <th>感応度(pt, 空欄=自動推計)</th>
              <th>換算: 売上高(百万)</th>
              <th>換算: 営業利益(百万)</th>
              <th>取引: 純受払額(百万)</th>
              <th>ヘッジ率(%)</th>
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
                    value={c.initialPlanRate}
                    onChange={(e) => updateCurrency(c.code, { initialPlanRate: Number(e.target.value) })}
                  />
                </td>
                <td>
                  <input
                    className="cell-input"
                    type="number"
                    step="any"
                    placeholder="未修正"
                    value={c.revisedPlanRate ?? ''}
                    onChange={(e) =>
                      updateCurrency(c.code, {
                        revisedPlanRate: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    className="cell-input"
                    type="number"
                    step="any"
                    value={c.prevYearAvgRate}
                    onChange={(e) => updateCurrency(c.code, { prevYearAvgRate: Number(e.target.value) })}
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
                <td>
                  <input
                    className="cell-input"
                    type="number"
                    step="any"
                    value={c.transactionExposure}
                    onChange={(e) => updateCurrency(c.code, { transactionExposure: Number(e.target.value) })}
                  />
                </td>
                <td>
                  <input
                    className="cell-input"
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={c.hedgeRatio}
                    onChange={(e) => updateCurrency(c.code, { hedgeRatio: Number(e.target.value) })}
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
