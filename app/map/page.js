import Link from 'next/link';
import { MapPin, Search } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { LOCATIONS } from '@/lib/constants';
import PageTitle from '@/components/PageTitle';
import StatusBadge from '@/components/StatusBadge';


const colorOf = (reports) =>
  reports.some((r) => r.status === 'NOUVEAU') ? 'blue' : reports.some((r) => r.status !== 'RESOLU') ? 'orange' : 'green';

export default async function MapPage({ searchParams }) {
  await requireUser();
  const { q = '' } = await searchParams;
  const reports = await prisma.report.findMany({
    where: q ? { location: { contains: q } } : {},
    select: { id: true, title: true, location: true, category: true, status: true },
    orderBy: { createdAt: 'desc' },
  });
  const places = LOCATIONS.map((l) => ({ ...l, reports: reports.filter((r) => r.location === l.name) })).filter((l) => l.reports.length);

  return (
    <>
      <PageTitle eyebrow="VUE GÉOGRAPHIQUE" title="Carte des signalements"
        text="Repérez les problèmes autour de vous et identifiez les zones qui demandent le plus d'attention." />

      <div className="card map-layout">
        <div className="map-list">
          <form role="search" className="search">
            <Search size={18} aria-hidden />
            <label className="sr-only" htmlFor="q">Rechercher un lieu</label>
            <input id="q" name="q" defaultValue={q} placeholder="Rechercher un lieu…" />
          </form>
          {reports.length === 0 && <p className="empty">Aucun signalement pour ce lieu.</p>}
          <ul className="rows">
            {reports.map((r) => (
              <li key={r.id}>
                <Link href={`/reports/${r.id}`} className="map-item">
                  <span><strong>{r.title}</strong><span className="muted small">{r.location} · {r.category}</span></span>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="map" role="img" aria-label="Plan du campus avec les lieux signalés">
          <div className="legend">
            <p className="eyebrow muted">LÉGENDE</p>
            <p><span className="dot blue" /> Nouveau</p>
            <p><span className="dot orange" /> En traitement</p>
            <p><span className="dot green" /> Résolu</p>
          </div>
          {places.map((p) => (
            <Link key={p.name} href={`/reports?location=${encodeURIComponent(p.name)}`} className={`marker ${colorOf(p.reports)}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }} title={`${p.name} : ${p.reports.length} signalement(s)`}>
              <MapPin size={20} aria-hidden />
              <span className="sr-only">{p.name} : {p.reports.length} signalement(s)</span>
            </Link>
          ))}
          <div className="map-count"><strong>{reports.length} signalement(s) visible(s)</strong><span className="muted small">Campus central</span></div>
        </div>
      </div>
    </>
  );
}
