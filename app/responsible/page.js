import { TriangleAlert, UserCheck, Clock, CircleCheck } from 'lucide-react';
import { prisma, withSupports } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { isUrgent, avgDelay } from '@/lib/constants';
import PageTitle from '@/components/PageTitle';
import StatCard from '@/components/StatCard';
import ReportList from '@/components/ReportList';

export default async function ResponsiblePage() {
  const user = await requireUser('RESPONSABLE', 'ADMIN');
  const mine = user.role === 'RESPONSABLE' ? { assigneeId: user.id } : {};
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [toQualify, assigned, inProgress, resolvedMonth, active, resolved] = await Promise.all([
    prisma.report.count({ where: { status: 'NOUVEAU', assigneeId: null } }),
    prisma.report.count({ where: { ...mine, assigneeId: mine.assigneeId ?? { not: null }, status: { not: 'RESOLU' } } }),
    prisma.report.count({ where: { ...mine, status: 'EN_COURS' } }),
    prisma.report.count({ where: { ...mine, resolvedAt: { gte: monthStart } } }),
    prisma.report.findMany({ where: { ...mine, status: { not: 'RESOLU' } }, include: withSupports, orderBy: { createdAt: 'asc' } }),
    prisma.report.findMany({ where: { ...mine, status: 'RESOLU' }, select: { createdAt: true, resolvedAt: true } }),
  ]);
  const priorities = [...active].sort((a, b) => isUrgent(b) - isUrgent(a));

  return (
    <>
      <PageTitle eyebrow="ESPACE RESPONSABLE" title="File d'intervention"
        text="Priorisez, attribuez et suivez les problèmes jusqu'à leur résolution documentée." />

      <div className="grid-2">
        <StatCard icon={TriangleAlert} value={toQualify} label="À qualifier (nouveaux non attribués)" />
        <StatCard icon={UserCheck} value={assigned} label="Assignés" color="purple" />
        <StatCard icon={Clock} value={inProgress} label="En intervention" color="orange" />
        <StatCard icon={CircleCheck} value={resolvedMonth} label="Résolus ce mois" color="green" />
      </div>

      <ReportList title="Priorités opérationnelles" subtitle="Demandes actives triées par urgence et ancienneté"
        reports={priorities} empty="Aucune demande active." />

      <section className="card panel">
        <p className="eyebrow muted">PERFORMANCE</p>
        <strong className="stat-value">{avgDelay(resolved)}</strong>
        <p className="muted">Délai moyen de résolution ({resolved.length} signalement(s) résolu(s))</p>
      </section>

      <section className="card tip dark">
        <p className="eyebrow">RAPPEL MÉTIER</p>
        <h2>Documentez chaque résolution.</h2>
        <p>Une description de l&apos;intervention est obligatoire avant de passer un signalement à « Résolu ».</p>
      </section>
    </>
  );
}
