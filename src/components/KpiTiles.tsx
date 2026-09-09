export interface KpiTile {
  label: string
  arrow: string
  value: string
  caption: string
}

export default function KpiTiles({ tiles }: { tiles: KpiTile[] }) {
  return (
    <div className="kpi-row">
      {tiles.map((t) => (
        <div className="kpi-tile" key={t.label}>
          <p className="kpi-label">{t.label}</p>
          <p className="kpi-value">
            <span className="kpi-arrow">{t.arrow}</span>
            {t.value}
          </p>
          <p className="kpi-caption">{t.caption}</p>
        </div>
      ))}
    </div>
  )
}
