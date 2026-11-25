import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="card empty-state" style={{ margin: '4rem auto', maxWidth: 520 }}>
      <h1>Page introuvable</h1>
      <Link href="/dashboard">Retour à l&apos;accueil</Link>
    </main>
  );
}
