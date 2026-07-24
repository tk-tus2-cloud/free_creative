import type { FxCurrency, FxData } from './types'

const STORAGE_KEY = 'fx-impact-simulation:v3'

// サンプルの前提データ。4月〜9月は実績確定、10月以降(0)は未確定。
// 取引エクスポージャーは受取+/支払−の年間純額。USD は原材料輸入の支払超過を想定してマイナス。
// 修正計画レートは上期実績を受けた期中見直し(2Q時点)を想定。
function seedFxData(): FxData {
  const currencies: FxCurrency[] = [
    {
      code: 'USD',
      name: '米ドル',
      digits: 1,
      initialPlanRate: 145.0,
      revisedPlanRate: 147.0,
      prevYearAvgRate: 142.5,
      monthlyRates: [143.2, 144.1, 145.8, 146.5, 147.6, 148.4, 0, 0, 0, 0, 0, 0],
      betaOverride: null,
      salesExposure: 180,
      profitExposure: 22,
      transactionExposure: -250,
      hedgeRatio: 50,
    },
    {
      code: 'CNY',
      name: '中国元',
      digits: 2,
      initialPlanRate: 20.0,
      revisedPlanRate: 20.2,
      prevYearAvgRate: 19.7,
      monthlyRates: [19.85, 19.94, 20.1, 20.17, 20.27, 20.35, 0, 0, 0, 0, 0, 0],
      betaOverride: null,
      salesExposure: 2800,
      profitExposure: 310,
      transactionExposure: 0,
      hedgeRatio: 0,
    },
    {
      code: 'THB',
      name: 'タイバーツ',
      digits: 2,
      initialPlanRate: 4.2,
      revisedPlanRate: 4.25,
      prevYearAvgRate: 4.1,
      monthlyRates: [4.16, 4.18, 4.22, 4.24, 4.27, 4.29, 0, 0, 0, 0, 0, 0],
      betaOverride: null,
      salesExposure: 11000,
      profitExposure: 1350,
      transactionExposure: 0,
      hedgeRatio: 0,
    },
    {
      code: 'MYR',
      name: 'マレーシアリンギット',
      digits: 2,
      initialPlanRate: 32.5,
      revisedPlanRate: 32.7,
      prevYearAvgRate: 31.8,
      monthlyRates: [32.1, 32.22, 32.45, 32.55, 32.7, 32.8, 0, 0, 0, 0, 0, 0],
      betaOverride: null,
      salesExposure: 850,
      profitExposure: 95,
      transactionExposure: 0,
      hedgeRatio: 0,
    },
    {
      code: 'KRW',
      name: '韓国ウォン',
      digits: 4,
      initialPlanRate: 0.105,
      revisedPlanRate: 0.1055,
      prevYearAvgRate: 0.1032,
      monthlyRates: [0.1042, 0.1045, 0.1051, 0.1053, 0.1057, 0.106, 0, 0, 0, 0, 0, 0],
      betaOverride: null,
      salesExposure: 310000,
      profitExposure: 36000,
      transactionExposure: 0,
      hedgeRatio: 0,
    },
    {
      code: 'TWD',
      name: '台湾ドル',
      digits: 2,
      initialPlanRate: 4.55,
      revisedPlanRate: 4.58,
      prevYearAvgRate: 4.42,
      monthlyRates: [4.5, 4.515, 4.545, 4.555, 4.575, 4.59, 0, 0, 0, 0, 0, 0],
      betaOverride: null,
      salesExposure: 3100,
      profitExposure: 360,
      transactionExposure: 0,
      hedgeRatio: 0,
    },
  ]
  return { currencies }
}

function normalizeCurrency(c: FxCurrency): FxCurrency {
  return {
    ...c,
    initialPlanRate: Number.isFinite(c.initialPlanRate) ? c.initialPlanRate : 0,
    revisedPlanRate: c.revisedPlanRate !== null && Number.isFinite(c.revisedPlanRate) ? c.revisedPlanRate : null,
    prevYearAvgRate: Number.isFinite(c.prevYearAvgRate) ? c.prevYearAvgRate : 0,
    transactionExposure: Number.isFinite(c.transactionExposure) ? c.transactionExposure : 0,
    hedgeRatio: Number.isFinite(c.hedgeRatio) ? c.hedgeRatio : 0,
  }
}

export function loadFxData(): FxData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedFxData()
    const parsed = JSON.parse(raw) as FxData
    if (!parsed.currencies || !Array.isArray(parsed.currencies)) return seedFxData()
    return { ...parsed, currencies: parsed.currencies.map(normalizeCurrency) }
  } catch {
    return seedFxData()
  }
}

export function saveFxData(data: FxData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
