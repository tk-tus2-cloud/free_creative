export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0)
}

export interface LinRegResult {
  slope: number
  intercept: number
  start: number
  end: number
}

export function linreg(values: number[]): LinRegResult {
  const n = values.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept, start: intercept, end: intercept + slope * (n - 1) }
}

export function trailingMovingAverage(values: number[], window: number): (number | null)[] {
  const out: (number | null)[] = []
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      out.push(null)
      continue
    }
    let s = 0
    for (let k = 0; k < window; k++) s += values[i - k]
    out.push(s / window)
  }
  return out
}

export interface TrendStats {
  reg: LinRegResult
  pctOverPeriod: number
  yoy25: number
  yoy26: number
  yoyPct: number
}

export function trendStats(total: number[]): TrendStats {
  const reg = linreg(total)
  const pctOverPeriod = ((reg.end - reg.start) / reg.start) * 100
  const yoy25 = sum(total.slice(0, 8))
  const yoy26 = sum(total.slice(12, 20))
  const yoyPct = ((yoy26 - yoy25) / yoy25) * 100
  return { reg, pctOverPeriod, yoy25, yoy26, yoyPct }
}

export function arrowFor(pct: number): '▲' | '▼' | '▶' {
  if (pct > 0.5) return '▲'
  if (pct < -0.5) return '▼'
  return '▶'
}
