'use client';

export default function Error({ reset }) {
  return (
    <div role="alert" className="card empty-state">
      <h2>Une erreur est survenue</h2>
      <button onClick={reset}>Réessayer</button>
    </div>
  );
}
