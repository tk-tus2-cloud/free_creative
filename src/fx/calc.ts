import { USD_CODE, type FxCurrency, type FxData } from './types'

export function filledAverage(rates: number[]): number | null {
  const filled = rates.filter((r) => r > 0)
  if (filled.length === 0) return null
  return filled.reduce((a, b) => a + b, 0) / filled.length
}

export function latestRate(rates: number[]): number | null {
  for (let i = rates.length - 1; i >= 0; i--) {
    if (rates[i] > 0) return rates[i]
  }
  return null
}

// i番目 = i-1月 → i月 の変化率。どちらかの月が未確定なら null
function pctChanges(rates: number[]): (number | null)[] {
  return rates.map((r, i) => {
    if (i === 0) return null
    const prev = rates[i - 1]
    return prev > 0 && r > 0 ? r / prev - 1 : null
  })
}

// ドル円の変化率 x に対する通貨の変化率 y の感応度。原点回帰の傾き Σxy/Σx²
export function estimateBeta(rates: number[], usdRates: number[]): number | null {
  const xs = pctChanges(usdRates)
  const ys = pctChanges(rates)
  let sumXY = 0
  let sumXX = 0
  let n = 0
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i]
    const y = ys[i]
    if (x === null || y === null) continue
    sumXY += x * y
    sumXX += x * x
    n += 1
  }
  if (n < 2 || sumXX === 0) return null
  return sumXY / sumXX
}

export interface CurrencyStats {
  currency: FxCurrency
  yearAvg: number | null
  latest: number | null
  planRatio: number | null // 年平均レート / 計画レート (%)
  beta: number // ドル円感応度(USD は 1)
  betaIsAuto: boolean
  netTransaction: number // ヘッジ後の純取引エクスポージャー(百万 現地通貨)
  planGapSales: number | null // (年平均 - 計画) × 売上エクスポージャー (百万円)
  planGapProfit: number | null // (年平均 - 計画) × (換算 + ヘッジ後取引)エクスポージャー (百万円)
}

export function buildStats(data: FxData): CurrencyStats[] {
  const usd = data.currencies.find((c) => c.code === USD_CODE) ?? null
  return data.currencies.map((currency) => {
    const yearAvg = filledAverage(currency.monthlyRates)
    const latest = latestRate(currency.monthlyRates)
    let beta = 1
    let betaIsAuto = false
    if (currency.code !== USD_CODE) {
      if (currency.betaOverride !== null) {
        beta = currency.betaOverride
      } else {
        const estimated = usd ? estimateBeta(currency.monthlyRates, usd.monthlyRates) : null
        beta = estimated ?? 0
        betaIsAuto = true
      }
    }
    const gap = yearAvg === null ? null : yearAvg - currency.planRate
    const netTransaction = currency.transactionExposure * (1 - currency.hedgeRatio / 100)
    return {
      currency,
      yearAvg,
      latest,
      planRatio: yearAvg === null || currency.planRate === 0 ? null : (yearAvg / currency.planRate) * 100,
      beta,
      betaIsAuto,
      netTransaction,
      planGapSales: gap === null ? null : gap * currency.salesExposure,
      planGapProfit: gap === null ? null : gap * (currency.profitExposure + netTransaction),
    }
  })
}

export interface SimulationRow {
  code: string
  name: string
  digits: number
  beta: number
  baseRate: number
  newRate: number
  changePct: number
  salesImpact: number // 換算: 売上高への影響(百万円)
  translationImpact: number // 換算: 営業利益への影響(百万円)
  transactionImpact: number // 取引: ヘッジ後の営業利益への影響(百万円)
  profitImpact: number // 営業利益への影響合計(百万円)
}

export interface SimulationResult {
  usdBase: number
  usdChangePct: number
  rows: SimulationRow[]
  totalSales: number
  totalTranslation: number
  totalTransaction: number
  totalProfit: number
}

// ドル円が deltaUsdYen 円動いたとき、各通貨が感応度に応じて連動すると仮定した年間影響額。
// 営業利益への影響 = 換算影響(海外子会社利益の円換算) + 取引影響(ヘッジ後の純受払 × レート変化)
export function simulate(stats: CurrencyStats[], deltaUsdYen: number): SimulationResult | null {
  const usdStats = stats.find((s) => s.currency.code === USD_CODE)
  const usdBase = usdStats ? (usdStats.latest ?? usdStats.yearAvg ?? usdStats.currency.planRate) : null
  if (!usdBase) return null
  const usdChangePct = deltaUsdYen / usdBase

  const rows: SimulationRow[] = []
  for (const s of stats) {
    const baseRate = s.latest ?? s.yearAvg ?? s.currency.planRate
    if (!baseRate) continue
    const changePct = s.beta * usdChangePct
    const newRate = baseRate * (1 + changePct)
    const deltaRate = newRate - baseRate
    const translationImpact = s.currency.profitExposure * deltaRate
    const transactionImpact = s.netTransaction * deltaRate
    rows.push({
      code: s.currency.code,
      name: s.currency.name,
      digits: s.currency.digits,
      beta: s.beta,
      baseRate,
      newRate,
      changePct,
      salesImpact: s.currency.salesExposure * deltaRate,
      translationImpact,
      transactionImpact,
      profitImpact: translationImpact + transactionImpact,
    })
  }
  return {
    usdBase,
    usdChangePct,
    rows,
    totalSales: rows.reduce((a, r) => a + r.salesImpact, 0),
    totalTranslation: rows.reduce((a, r) => a + r.translationImpact, 0),
    totalTransaction: rows.reduce((a, r) => a + r.transactionImpact, 0),
    totalProfit: rows.reduce((a, r) => a + r.profitImpact, 0),
  }
}

export function formatRateValue(value: number | null, digits: number): string {
  if (value === null || !Number.isFinite(value)) return '-'
  return value.toLocaleString('ja-JP', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export function formatMillionYen(value: number | null, signed = false): string {
  if (value === null || !Number.isFinite(value)) return '-'
  const sign = signed && value > 0 ? '+' : ''
  return `${sign}${Math.round(value).toLocaleString('ja-JP')}百万円`
}

export function formatOkuYen(value: number | null, signed = false): string {
  if (value === null || !Number.isFinite(value)) return '-'
  const sign = signed && value > 0 ? '+' : ''
  return `${sign}${(value / 100).toLocaleString('ja-JP', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}億円`
}

export function formatSignedPct(value: number | null, digits = 2): string {
  if (value === null || !Number.isFinite(value)) return '-'
  const sign = value > 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(digits)}%`
}
