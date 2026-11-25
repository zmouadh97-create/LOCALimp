'use client';
import { useState } from 'react';
import Link from 'next/link';
import ActionForm from './ActionForm';
import { createReport, findSimilar } from '@/app/actions';
import { CATEGORIES, LOCATION_NAMES } from '@/lib/constants';

export default function ReportForm() {
  const [similar, setSimilar] = useState([]);

  // Fonctionnalité originale : détection de doublons quand on quitte le titre ou change le lieu
  async function check(e) {
    const form = e.target.form;
    setSimilar(await findSimilar(form.title.value, form.location.value));
  }

  return (
    <ActionForm action={createReport} submit="Envoyer le signalement" className="card form">
      <label>Titre<input name="title" required minLength={5} maxLength={100} onBlur={check} placeholder="ex. Lampadaire éteint devant la bibliothèque" /></label>
      <label>Description<textarea name="description" required minLength={10} maxLength={2000} rows={5} /></label>
      <div className="grid-2">
        <label>Catégorie
          <select name="category" required defaultValue="">
            <option value="" disabled>-- Choisir --</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Lieu
          <select name="location" required defaultValue="" onChange={check}>
            <option value="" disabled>-- Choisir --</option>
            {LOCATION_NAMES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
      </div>
      <label>Photo (facultative, 1 Mo max)<input type="file" name="photo" accept="image/*" /></label>

      {similar.length > 0 && (
        <aside className="warning" aria-live="polite">
          <strong>Ce problème a peut-être déjà été signalé.</strong> Soutenez-le plutôt que de créer un doublon :
          <ul>
            {similar.map((r) => (
              <li key={r.id}>
                <Link href={`/reports/${r.id}`} target="_blank">{r.title}</Link> — {r.location} ({r._count.supports} soutien(s))
              </li>
            ))}
          </ul>
        </aside>
      )}
    </ActionForm>
  );
}
