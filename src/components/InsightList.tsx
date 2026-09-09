export default function InsightList({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="insight-block">
      <p className="insight-title">{title}</p>
      <ul className="insight-list">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  )
}
