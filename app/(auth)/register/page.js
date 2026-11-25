import Link from 'next/link';
import ActionForm from '@/components/ActionForm';
import { register } from '@/app/actions';

export default function RegisterPage() {
  return (
    <>
      <p className="eyebrow">BIENVENUE</p>
      <h1>Créer un compte</h1>
      <p className="muted">Rejoignez la communauté et signalez les problèmes du campus.</p>
      <ActionForm action={register} submit="Créer mon compte">
        <label>Nom complet<input name="name" required minLength={2} autoComplete="name" /></label>
        <label>Adresse e-mail<input type="email" name="email" required autoComplete="email" placeholder="nom@universite.tn" /></label>
        <label>Mot de passe<input type="password" name="password" required minLength={8} autoComplete="new-password" placeholder="8 caractères minimum" /></label>
      </ActionForm>
      <p className="center">Déjà inscrit ? <Link href="/login">Se connecter</Link></p>
    </>
  );
}
