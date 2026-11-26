'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ClipboardList, Map, Gauge, ShieldCheck, BarChart3, Users } from 'lucide-react';

const LINKS = [
  { href: '/dashboard', label: "Vue d'ensemble", icon: LayoutGrid },
  { href: '/reports', label: 'Signalements', icon: ClipboardList },
  { href: '/map', label: 'Carte', icon: Map },
  { href: '/my-reports', label: 'Mes signalements', icon: Gauge },
  { href: '/responsible', label: "File d'intervention", icon: ShieldCheck, roles: ['RESPONSABLE', 'ADMIN'] },
  { href: '/pilotage', label: 'Pilotage', icon: BarChart3, roles: ['RESPONSABLE', 'ADMIN'] },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users, roles: ['ADMIN'] },
];

export default function NavLinks({ role }) {
  const path = usePathname();
  return (
    <nav aria-label="Navigation principale" className="side-nav">
      {LINKS.filter((l) => !l.roles || l.roles.includes(role)).map(({ href, label, icon: Icon }) => {
        const active = href === '/reports' ? path === '/reports' || /^\/reports\/\d/.test(path) : path.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>
            <Icon size={22} aria-hidden /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
