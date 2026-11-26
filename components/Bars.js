const COLORS = ['#f5a524', '#1463ff', '#12b981', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function Bars({ title, subtitle, data }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  return (
    <section className="card panel">
      <h2>{title}</h2>
      {subtitle && <p className="muted small">{subtitle}</p>}
      {data.map(([label, n], i) => (
        <div key={label} className="bar">
          <div className="bar-label"><span>{label}</span><strong>{n}</strong></div>
          <div className="track"><span style={{ width: `${(n / max) * 100}%`, background: COLORS[i % COLORS.length] }} /></div>
        </div>
      ))}
    </section>
  );
}
