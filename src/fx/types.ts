export interface FxCurrency {
  code: string // ISO通貨コード
  name: string
  digits: number // レート表示の小数桁数
  planRate: number // 計画レート(円/通貨)
  monthlyRates: number[] // 月中平均レート(円/通貨)。未確定月は 0
  betaOverride: number | null // ドル円感応度の手動設定。null なら実績から自動推計
  salesExposure: number // 換算: 海外子会社の年間売上高(百万 現地通貨)
  profitExposure: number // 換算: 海外子会社の年間営業利益(百万 現地通貨)
  transactionExposure: number // 取引: 年間の純受払額(受取+/支払−, 百万 現地通貨)。輸入原材料の支払超過ならマイナス
  hedgeRatio: number // 取引エクスポージャーのヘッジ率(%)
}

export interface FxData {
  currencies: FxCurrency[]
}

export const USD_CODE = 'USD'
