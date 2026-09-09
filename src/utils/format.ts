export function formatYen(value: number): string {
  const sign = value < 0 ? '-' : ''
  return `${sign}¥${Math.round(Math.abs(value)).toLocaleString('ja-JP')}`
}

export function formatHours(value: number): string {
  return `${value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}時間`
}

export function formatMonthShort(label: string): string {
  // "2025年1月" -> "25/1"
  const m = /^(\d{4})年(\d{1,2})月$/.exec(label)
  if (!m) return label
  return `${m[1].slice(2)}/${m[2]}`
}

export function formatRate(rate: number | null): string {
  if (rate === null || !Number.isFinite(rate)) return '-'
  return `${rate.toFixed(1)}%`
}

export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const escape = (cell: string | number): string => {
    const str = String(cell)
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
