// dataviz スキルの検証済みデフォルトパレット（8色・固定順）
export const CATEGORICAL_COLORS: Record<string, string> = {
  slot1: '#2a78d6', // blue
  slot2: '#eb6834', // orange
  slot3: '#1baf7a', // aqua
  slot4: '#eda100', // yellow
  slot5: '#e87ba4', // magenta
  slot6: '#008300', // green
  slot7: '#4a3aa7', // violet
  slot8: '#e34948', // red
}

export const CATEGORICAL_ORDER = [
  CATEGORICAL_COLORS.slot1,
  CATEGORICAL_COLORS.slot2,
  CATEGORICAL_COLORS.slot3,
  CATEGORICAL_COLORS.slot4,
  CATEGORICAL_COLORS.slot5,
  CATEGORICAL_COLORS.slot6,
  CATEGORICAL_COLORS.slot7,
  CATEGORICAL_COLORS.slot8,
]

export function colorForIndex(i: number): string {
  return CATEGORICAL_ORDER[i % CATEGORICAL_ORDER.length]
}
