import Link from 'next/link';
import ActionForm from '@/components/ActionForm';
import { login } from '@/app/actions';

export default function LoginPage() {
  return (
    <>
      <p className="eyebrow">BON RETOUR</p>
      <h1>Connectez-vous</h1>
      <p className="muted">Accédez à vos signalements et aux dernières avancées.</p>
      <ActionForm action={login} submit="Se connecter">
        <label>Adresse e-mail<input type="email" name="email" required autoComplete="email" placeholder="nom@universite.tn" /></label>
        <label>Mot de passe<input type="password" name="password" required autoComplete="current-password" /></label>
      </ActionForm>
      <p className="center">Nouveau sur LocalImpact ? <Link href="/register">Créer un compte</Link></p>
      <div className="demo">
        <strong>Comptes de démonstration</strong>
        <p>utilisateur@localimpact.tn · responsable@localimpact.tn · admin@localimpact.tn</p>
        <p>Mot de passe : <strong>Impact2026!</strong></p>
      </div>
    </>
  );
}
