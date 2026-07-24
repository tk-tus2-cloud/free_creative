export interface FxCurrency {
  code: string // ISO通貨コード
  name: string
  digits: number // レート表示の小数桁数
  planRate: number // 計画レート(円/通貨)
  monthlyRates: number[] // 月中平均レート(円/通貨)。未確定月は 0
  betaOverride: number | null // ドル円感応度の手動設定。null なら実績から自動推計
  salesExposure: number // 年間の外貨建て売上高(百万 現地通貨)
  profitExposure: number // 年間の外貨建て営業利益(百万 現地通貨)
}

export interface FxData {
  currencies: FxCurrency[]
}

export const USD_CODE = 'USD'
