import ReportRow from './ReportRow';

export default function ReportList({ title, subtitle, action, reports, empty = 'Aucun signalement.' }) {
  return (
    <section className="card panel">
      <header className="panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted small">{subtitle}</p>}
        </div>
        {action}
      </header>
      {reports.length === 0 ? <p className="empty">{empty}</p> : <ul className="rows">{reports.map((r) => <ReportRow key={r.id} report={r} />)}</ul>}
    </section>
  );
}
