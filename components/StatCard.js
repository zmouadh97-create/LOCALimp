export default function StatCard({ icon: Icon, value, label, color = 'blue', note }) {
  return (
    <div className="card stat">
      <div className="stat-top">
        <span className={`icon-box ${color}`}><Icon size={22} aria-hidden /></span>
        {note && <span className="pill">{note}</span>}
      </div>
      <strong className="stat-value">{value}</strong>
      <span className="muted">{label}</span>
    </div>
  );
}
