import { ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/db';
import { avgDelay } from '@/lib/constants';
import Logo from '@/components/Logo';

// Rendu à chaque requête : les chiffres affichés restent à jour
export const dynamic = 'force-dynamic';

// Écran partagé connexion / inscription, avec des chiffres réels du campus
export default async function AuthLayout({ children }) {
  const [total, resolved] = await Promise.all([
    prisma.report.count(),
    prisma.report.findMany({ where: { status: 'RESOLU' }, select: { createdAt: true, resolvedAt: true } }),
  ]);
  const rate = total ? Math.round((resolved.length / total) * 100) : 0;

  return (
    <div className="auth">
      <section className="auth-hero">
        <Logo dark />
        <p className="eyebrow">VOTRE CAMPUS, VOTRE IMPACT</p>
        <h1>Les petites actions changent vraiment le quotidien.</h1>
        <p className="lead">Signalez un problème en quelques secondes et suivez chaque étape jusqu&apos;à sa résolution.</p>
        <div className="hero-stats">
          <div><strong>{total}</strong><span>signalements</span></div>
          <div><strong>{rate} %</strong><span>résolus</span></div>
          <div><strong>{avgDelay(resolved)}</strong><span>délai moyen</span></div>
        </div>
        <p className="small"><ShieldCheck size={16} aria-hidden /> Vos données sont protégées par des contrôles d&apos;accès serveur.</p>
      </section>
      <main id="main" className="auth-form">{children}</main>
    </div>
  );
}
