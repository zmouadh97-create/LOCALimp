import Link from 'next/link';
import { Plus, FileText, FileClock, FileCheck, ArrowUpRight } from 'lucide-react';
import { prisma, withSupports } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import PageTitle from '@/components/PageTitle';
import StatCard from '@/components/StatCard';
import ReportList from '@/components/ReportList';

export default async function MyReportsPage() {
  const user = await requireUser();
  const reports = await prisma.report.findMany({ where: { authorId: user.id }, include: withSupports, orderBy: { createdAt: 'desc' } });
  const resolved = reports.filter((r) => r.status === 'RESOLU').length;

  return (
    <>
      <PageTitle eyebrow="MON ACTIVITÉ" title="Mes signalements"
        text="Retrouvez les problèmes que vous avez signalés et leur état d'avancement.">
        <Link href="/reports/new" className="button"><Plus size={20} aria-hidden /> Nouveau signalement</Link>
      </PageTitle>

      <div className="grid-3">
        <StatCard icon={FileText} value={reports.length} label="Total" />
        <StatCard icon={FileClock} value={reports.length - resolved} label="En traitement" color="orange" />
        <StatCard icon={FileCheck} value={resolved} label="Résolus" color="green" />
      </div>

      {reports.length === 0 ? (
        <section className="card empty-state">
          <span className="icon-box blue"><ArrowUpRight size={26} aria-hidden /></span>
          <h2>Vous n&apos;avez encore rien signalé</h2>
          <p className="muted">Créez votre premier signalement pour contribuer à l&apos;amélioration du campus.</p>
        </section>
      ) : (
        <ReportList title="Mes demandes" reports={reports} />
      )}
    </>
  );
}
