import Link from 'next/link';
import { ArrowRight, Megaphone, Clock, CircleCheck, TrendingUp } from 'lucide-react';
import { prisma, withSupports } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { CATEGORIES } from '@/lib/constants';
import PageTitle from '@/components/PageTitle';
import StatCard from '@/components/StatCard';
import ReportList from '@/components/ReportList';
import Bars from '@/components/Bars';

export default async function OverviewPage() {
  await requireUser();
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const [active, inProgress, resolved, resolvedWeek, supports, recent, byCategory] = await Promise.all([
    prisma.report.count({ where: { status: { not: 'RESOLU' } } }),
    prisma.report.count({ where: { status: { in: ['PRIS_EN_CHARGE', 'EN_COURS'] } } }),
    prisma.report.count({ where: { status: 'RESOLU' } }),
    prisma.report.count({ where: { resolvedAt: { gte: weekAgo } } }),
    prisma.support.count(),
    prisma.report.findMany({ include: withSupports, orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.report.groupBy({ by: ['category'], _count: true }),
  ]);

  return (
    <>
      <PageTitle eyebrow="VUE D'ENSEMBLE" title="Votre campus en un coup d'œil"
        text="Suivez les demandes récentes, les priorités et les progrès réalisés par la communauté.">
        <Link href="/reports" className="button ghost">Tous les signalements <ArrowRight size={18} aria-hidden /></Link>
      </PageTitle>

      <div className="grid-2">
        <StatCard icon={Megaphone} value={active} label="Signalements actifs" />
        <StatCard icon={Clock} value={inProgress} label="En traitement" color="orange" />
        <StatCard icon={CircleCheck} value={resolved} label="Problèmes résolus" color="green" note={`${resolvedWeek} cette semaine`} />
        <StatCard icon={TrendingUp} value={supports} label="Soutiens citoyens" color="purple" />
      </div>

      <ReportList title="Signalements récents" subtitle="Les dernières demandes de la communauté" reports={recent}
        action={<Link href="/reports">Voir tout</Link>} empty="Aucun signalement pour le moment." />

      <Bars title="Par catégorie" subtitle="Répartition actuelle"
        data={CATEGORIES.map((c) => [c, byCategory.find((g) => g.category === c)?._count ?? 0])} />

      <section className="card tip">
        <p className="eyebrow">CONSEIL DU JOUR</p>
        <h2>Une photo claire accélère le diagnostic.</h2>
        <p>Ajoutez une vue d&apos;ensemble et indiquez précisément le bâtiment ou l&apos;étage.</p>
        <Link href="/reports/new">Créer un signalement <ArrowRight size={18} aria-hidden /></Link>
      </section>
    </>
  );
}
