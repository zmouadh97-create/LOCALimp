import { Search } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { updateRole } from '@/app/actions';
import ActionForm from '@/components/ActionForm';
import PageTitle from '@/components/PageTitle';

const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export default async function UsersPage({ searchParams }) {
  await requireUser('ADMIN');
  const { q = '' } = await searchParams;
  const users = await prisma.user.findMany({
    where: q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {},
    orderBy: { name: 'asc' },
  });

  return (
    <>
      <PageTitle eyebrow="ADMINISTRATION" title="Utilisateurs et rôles"
        text="Gérez les accès utilisateur, responsable et administrateur depuis un espace unique." />

      <section className="card panel">
        <header className="panel-head">
          <form role="search" className="search">
            <Search size={18} aria-hidden />
            <label className="sr-only" htmlFor="uq">Rechercher un utilisateur</label>
            <input id="uq" name="q" defaultValue={q} placeholder="Rechercher un utilisateur…" />
          </form>
          <span className="muted small">{users.length} compte(s)</span>
        </header>
        {users.length === 0 ? <p className="empty">Aucun utilisateur trouvé.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">Utilisateur</th><th scope="col">Rôle</th><th scope="col">Inscription</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="user-cell">
                        <span className="avatar">{initials(u.name)}</span>
                        <span><strong>{u.name}</strong><span className="muted small">{u.email}</span></span>
                      </span>
                    </td>
                    <td>
                      <ActionForm action={updateRole.bind(null, u.id)} submit="Enregistrer" className="inline">
                        <select name="role" defaultValue={u.role} aria-label={`Rôle de ${u.name}`}>
                          {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </ActionForm>
                    </td>
                    <td className="muted">{u.createdAt.toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
