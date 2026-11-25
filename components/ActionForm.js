'use client';
import { useActionState } from 'react';

// Formulaire réutilisable : gère l'état de chargement et les messages renvoyés par la Server Action
export default function ActionForm({ action, submit, children, className = 'form' }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error && <p role="alert" className="error">{state.error}</p>}
      {state?.ok && <p role="status" className="success">{state.ok}</p>}
      <button type="submit" disabled={pending}>{pending ? 'Envoi…' : submit}</button>
    </form>
  );
}
