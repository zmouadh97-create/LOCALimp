import { Activity, Gauge, Users, Timer } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { STATUSES, CATEGORIES, avgDelay } from '@/lib/constants';
import PageTitle from '@/components/PageTitle';
import StatCard from '@/components/StatCard';
import Bars from '@/components/Bars';

const WEEK = 7 * 86400000;

export default async function PilotagePage() {
  await requireUser('RESPONSABLE', 'ADMIN');
  // Tableau de bord : toutes les valeurs sont calculées depuis les données enregistrées
  const [reports, users] = await Promise.all([
    prisma.report.findMany({ select: { status: true, category: true, createdAt: true, resolvedAt: true } }),
    prisma.user.count(),
  ]);
  const resolved = reports.filter((r) => r.status === 'RESOLU');
  const rate = reports.length ? Math.round((resolved.length / reports.length) * 100) : 0;

  // Volume par semaine sur les 8 dernières semaines (créés / résolus)
  const now = Date.now();
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = now - (7 - i) * WEEK, start = end - WEEK;
    const inWeek = (d) => d && d >= start && d < end;
    return {
      label: new Date(start).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      created: reports.filter((r) => inWeek(r.createdAt.getTime())).length,
      resolved: reports.filter((r) => inWeek(r.resolvedAt?.getTime())).length,
    };
  });
  const max = Math.max(1, ...weeks.flatMap((w) => [w.created, w.resolved]));

  return (
    <>
      <PageTitle eyebrow="ADMINISTRATION" title="Pilotage de la plateforme"
        text="Mesurez l'activité, la répartition des problèmes et les délais de résolution." />

      <div className="grid-2">
        <StatCard icon={Activity} value={reports.length} label="Signalements totaux" />
        <StatCard icon={Gauge} value={`${rate} %`} label="Taux de résolution" color="green" />
        <StatCard icon={Users} value={users} label="Utilisateurs inscrits" color="purple" />
        <StatCard icon={Timer} value={avgDelay(resolved)} label="Délai moyen de résolution" color="orange" />
      </div>

      <section className="card panel">
        <h2>Volume et résolutions</h2>
        <p className="muted small">Évolution sur les 8 dernières semaines</p>
        <div className="chart" role="img" aria-label="Signalements créés et résolus par semaine">
          {weeks.map((w) => (
            <div key={w.label} className="chart-col">
              <div className="chart-bars">
                <span className="col blue" style={{ height: `${(w.created / max) * 100}%` }} title={`${w.created} créé(s)`} />
                <span className="col green" style={{ height: `${(w.resolved / max) * 100}%` }} title={`${w.resolved} résolu(s)`} />
              </div>
              <span className="muted small">{w.label}</span>
            </div>
          ))}
        </div>
        <p className="chart-legend"><span><span className="dot blue" /> Créés</span><span><span className="dot green" /> Résolus</span></p>
      </section>

      <div className="grid-2">
        <Bars title="Par statut" data={Object.entries(STATUSES).map(([k, v]) => [v, reports.filter((r) => r.status === k).length])} />
        <Bars title="Par catégorie" data={CATEGORIES.map((c) => [c, reports.filter((r) => r.category === c).length])} />
      </div>

      <section className="card panel">
        <h2>Délai de résolution par catégorie</h2>
        <table>
          <thead><tr><th scope="col">Catégorie</th><th scope="col">Résolus</th><th scope="col">Délai moyen</th></tr></thead>
          <tbody>
            {CATEGORIES.map((c) => {
              const list = resolved.filter((r) => r.category === c);
              return <tr key={c}><td>{c}</td><td>{list.length}</td><td>{avgDelay(list)}</td></tr>;
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
