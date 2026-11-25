import Link from 'next/link';
import { Plus, LogOut } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { logout } from '@/app/actions';
import Logo from '@/components/Logo';
import NavLinks from '@/components/NavLinks';

const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

// Mise en page de l'espace connecté : menu latéral + en-tête
export default async function AppLayout({ children }) {
  const user = await requireUser();
  return (
    <div className="shell">
      <aside className="sidebar">
        <Logo />
        <p className="eyebrow muted">ESPACE DE TRAVAIL</p>
        <NavLinks role={user.role} />
        <div className="help">
          <p className="help-title"><span className="dot" /> Avant de signaler</p>
          <p>Vérifiez si le problème existe déjà et soutenez-le pour éviter les doublons.</p>
          <Link href="/reports">Voir les signalements</Link>
        </div>
        <div className="profile">
          <span className="avatar">{initials(user.name)}</span>
          <span>
            <strong>{user.name}</strong>
            <span className="muted small">{ROLES[user.role]}</span>
          </span>
          <form action={logout}>
            <button className="icon-btn" aria-label="Se déconnecter" title="Se déconnecter"><LogOut size={18} /></button>
          </form>
        </div>
      </aside>
      <div className="content">
        <header className="topbar">
          <div>
            <p className="muted small">Campus central</p>
            <strong>Bonjour, {user.name.split(' ')[0]}</strong>
          </div>
          <Link href="/reports/new" className="button"><Plus size={20} aria-hidden /> Nouveau signalement</Link>
        </header>
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
