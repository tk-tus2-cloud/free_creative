import type { FxCurrency, FxData } from './types'

const STORAGE_KEY = 'fx-impact-simulation:v1'

// サンプルの前提データ。4月〜9月は実績確定、10月以降(0)は未確定
function seedFxData(): FxData {
  const currencies: FxCurrency[] = [
    {
      code: 'USD',
      name: '米ドル',
      digits: 1,
      planRate: 145.0,
      monthlyRates: [143.2, 144.1, 145.8, 146.5, 147.6, 148.4, 0, 0, 0, 0, 0, 0],
      betaOverride: null,
      salesExposure: 180,
      profitExposure: 22,
    },
    {
      code: 'CNY',
      name: '中国元',
      digits: 2,
      planRate: 20.0,
      monthlyRates: [19.85, 19.94, 20.1, 20.17, 20.27, 20.35, 0, 0, 0, 0, 0, 0],
      betaOverride: null,
      salesExposure: 2800,
      profitExposure: 310,
    },
    {
      code: 'THB',
      name: 'タイバーツ',
      digits: 2,
      planRate: 4.2,
      monthlyRates: [4.16, 4.18, 4.22, 4.24, 4.27, 4.29, 0, 0, 0, 0, 0, 0],
      betaOverride: null,
      salesExposure: 11000,
      profitExposure: 1350,
    },
    {
      code: 'MYR',
      name: 'マレーシアリンギット',
      digits: 2,
      planRate: 32.5,
      monthlyRates: [32.1, 32.22, 32.45, 32.55, 32.7, 32.8, 0, 0, 0, 0, 0, 0],
      betaOverride: null,
      salesExposure: 850,
      profitExposure: 95,
    },
    {
      code: 'KRW',
      name: '韓国ウォン',
      digits: 4,
      planRate: 0.105,
      monthlyRates: [0.1042, 0.1045, 0.1051, 0.1053, 0.1057, 0.106, 0, 0, 0, 0, 0, 0],
      betaOverride: null,
      salesExposure: 310000,
      profitExposure: 36000,
    },
    {
      code: 'TWD',
      name: '台湾ドル',
      digits: 2,
      planRate: 4.55,
      monthlyRates: [4.5, 4.515, 4.545, 4.555, 4.575, 4.59, 0, 0, 0, 0, 0, 0],
      betaOverride: null,
      salesExposure: 3100,
      profitExposure: 360,
    },
  ]
  return { currencies }
}

export function loadFxData(): FxData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedFxData()
    const parsed = JSON.parse(raw) as FxData
    if (!parsed.currencies || !Array.isArray(parsed.currencies)) return seedFxData()
    return parsed
  } catch {
    return seedFxData()
  }
}

export function saveFxData(data: FxData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
