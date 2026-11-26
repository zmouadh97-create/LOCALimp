import { notFound } from 'next/navigation';
import { ThumbsUp } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { STATUSES, NEXT_STATUS, isUrgent } from '@/lib/constants';
import { supportReport, addComment, assignReport, changeStatus } from '@/app/actions';
import ActionForm from '@/components/ActionForm';
import StatusBadge from '@/components/StatusBadge';
import PageTitle from '@/components/PageTitle';

const fmt = (d) => d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

export default async function ReportPage({ params }) {
  const user = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      assignee: { select: { name: true } },
      supports: { select: { userId: true } },
      _count: { select: { supports: true } },
      comments: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
      history: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!report) notFound();

  const supported = report.supports.some((s) => s.userId === user.id);
  const next = NEXT_STATUS[report.status];
  const canChangeStatus = next && (user.role === 'ADMIN' || report.assigneeId === user.id);
  const responsables = user.role === 'ADMIN'
    ? await prisma.user.findMany({ where: { role: 'RESPONSABLE' }, select: { id: true, name: true } })
    : [];

  return (
    <>
      <PageTitle eyebrow={`SIGNALEMENT #${report.id} · ${report.category.toUpperCase()}`} title={report.title}>
        <form action={supportReport.bind(null, id)}>
          <button disabled={supported} className={supported ? 'ghost' : ''}>
            <ThumbsUp size={18} aria-hidden /> {supported ? 'Soutenu' : 'Je suis concerné(e)'} · {report._count.supports}
          </button>
        </form>
      </PageTitle>

      <div className="detail">
        <div className="stack">
          <section className="card panel">
            <p className="meta-line">
              <StatusBadge status={report.status} />
              {isUrgent(report) && <span className="urgent">URGENT</span>}
              <span className="muted">{report.location} · par {report.author.name} le {fmt(report.createdAt)}</span>
            </p>
            <p className="pre">{report.description}</p>
            {report.photo && <img src={report.photo} alt={`Photo du signalement : ${report.title}`} className="photo" />}
            {report.resolution && <p className="success"><strong>Intervention :</strong> {report.resolution}</p>}
          </section>

          <section className="card panel">
            <h2>Commentaires</h2>
            {report.comments.length === 0 && <p className="empty">Aucun commentaire.</p>}
            <ul className="comments">
              {report.comments.map((c) => (
                <li key={c.id}>
                  <p className="muted small"><strong>{c.author.name}</strong> — {fmt(c.createdAt)}</p>
                  <p className="pre">{c.content}</p>
                </li>
              ))}
            </ul>
            <ActionForm action={addComment.bind(null, id)} submit="Commenter">
              <label>Demander ou apporter une précision<textarea name="content" required minLength={2} maxLength={1000} rows={2} /></label>
            </ActionForm>
          </section>
        </div>

        <div className="stack">
          <section className="card panel">
            <h2>Suivi</h2>
            <p className="muted">Responsable : <strong>{report.assignee?.name ?? 'non attribué'}</strong></p>
            {user.role === 'ADMIN' && (
              <ActionForm action={assignReport.bind(null, id)} submit="Attribuer">
                <label>Attribuer à
                  <select name="assigneeId" required defaultValue={report.assigneeId ?? ''}>
                    <option value="" disabled>-- Choisir un responsable --</option>
                    {responsables.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </label>
              </ActionForm>
            )}
            {canChangeStatus && (
              <ActionForm action={changeStatus.bind(null, id)} submit={`Passer à « ${STATUSES[next]} »`}>
                <input type="hidden" name="status" value={next} />
                {next === 'RESOLU' && (
                  <label>Description de l&apos;intervention
                    <textarea name="resolution" required minLength={10} rows={3} />
                  </label>
                )}
              </ActionForm>
            )}
          </section>

          <section className="card panel">
            <h2>Historique</h2>
            <ol className="timeline">
              {report.history.map((h) => (
                <li key={h.id}>
                  <strong>{h.action}</strong>
                  <span className="muted small">{fmt(h.createdAt)} · {h.author.name}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}
