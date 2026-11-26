import { Search, SlidersHorizontal } from 'lucide-react';
import { prisma, withSupports } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { CATEGORIES, LOCATION_NAMES, STATUSES } from '@/lib/constants';
import PageTitle from '@/components/PageTitle';
import ReportList from '@/components/ReportList';

export default async function ReportsPage({ searchParams }) {
  await requireUser();
  const { q = '', category = '', location = '', status = '', sort = 'recent' } = await searchParams;

  const reports = await prisma.report.findMany({
    where: {
      ...(q && { OR: [{ title: { contains: q } }, { description: { contains: q } }] }),
      ...(category && { category }),
      ...(location && { location }),
      ...(status && { status }),
    },
    include: withSupports,
    orderBy: sort === 'priority' ? [{ supports: { _count: 'desc' } }, { createdAt: 'desc' }] : { createdAt: 'desc' },
  });

  return (
    <>
      <PageTitle eyebrow="EXPLORER" title="Tous les signalements"
        text="Recherchez un problème existant avant d'en créer un nouveau et soutenez les demandes qui vous concernent." />

      <form className="card filters" role="search">
        <label className="search">
          <Search size={18} aria-hidden />
          <span className="sr-only">Rechercher</span>
          <input name="q" defaultValue={q} placeholder="Rechercher" />
        </label>
        <select name="category" defaultValue={category} aria-label="Catégorie">
          <option value="">Toutes catégories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select name="location" defaultValue={location} aria-label="Lieu">
          <option value="">Tous les lieux</option>
          {LOCATION_NAMES.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select name="status" defaultValue={status} aria-label="Statut">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="sort" defaultValue={sort} aria-label="Tri">
          <option value="recent">Plus récents</option>
          <option value="priority">Plus soutenus</option>
        </select>
        <button type="submit"><SlidersHorizontal size={18} aria-hidden /> Filtrer</button>
      </form>

      <ReportList title={`${reports.length} résultat(s)`} reports={reports}
        action={<span className="muted small">{sort === 'priority' ? 'Triés par nombre de soutiens' : 'Triés par date récente'}</span>}
        empty="Aucun signalement ne correspond à votre recherche." />
    </>
  );
}
