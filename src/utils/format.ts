export function formatYen(value: number): string {
  return `¥${Math.round(value).toLocaleString('ja-JP')}`
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
